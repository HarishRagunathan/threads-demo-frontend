import { PaymentPanel } from "./components/PaymentPanel.jsx";
import { BillReviewDialog } from "./components/BillReviewDialog.jsx";
import { HeldBillsDialog } from "./components/HeldBillsDialog.jsx";
import { BillTotals } from "./components/BillTotals.jsx";
import { CartItems } from "./components/CartItems.jsx";
import { ProductCatalog } from "./components/ProductCatalog.jsx";
import { ScannedItemsPanel } from "./components/ScannedItemsPanel.jsx";
import { resolvePayments, walkInPaymentError } from "./paymentState.js";
import { useApp } from "../../context/AppContext.jsx";
import { useData } from "../../hooks/useData.js";
import React, { useState, useRef } from "react";
import { uid } from "../../lib/format.js";
import { api } from "../../lib/api.js";
import { PageTitle } from "../../components/ui/PageTitle.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Pause, ShoppingBag, ArrowUpRight } from "lucide-react";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { Field } from "../../components/ui/Field.jsx";
import { Invoice } from "../invoices/InvoiceDialog.jsx";

export function POS({ kind = "sale", embedded = false, onComplete }) {
  const { settings, notify, user } = useApp(),
    products = useData("/products"),
    parties = useData(kind === "sale" ? "/customers" : "/suppliers"),
    held = useData("/held");
  const [search, setSearch] = useState(""),
    [cart, setCart] = useState([]),
    [party, setParty] = useState(""),
    [reference, setReference] = useState(""),
    [payments, setPayments] = useState([
      { method: "Cash", amount: "", reference: "" },
    ]),
    [cash, setCash] = useState(""),
    [error, setError] = useState(""),
    [preview, setPreview] = useState(false),
    [busy, setBusy] = useState(false),
    [invoice, setInvoice] = useState(null),
    [showHeld, setShowHeld] = useState(false),
    [heldId, setHeldId] = useState(null);
  const key = useRef(uid());
  const [automaticPayment, setAutomaticPayment] = useState(kind === "sale");
  const scanInput = useRef(null);
  const list = (products.data || []).filter(
    (p) =>
      p.active &&
      (p.name + " " + (p.category || "") + " " + (p.brand || ""))
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const add = (p) => {
    if (!p.active) {
      setError("This product is inactive.");
      return;
    }
    if (
      kind === "sale" &&
      Number(cart.find((i) => i.product_id === p.id)?.quantity || 0) >= p.stock
    ) {
      setError("No more stock available for " + p.name);
      return;
    }
    setError("");
    setCart((c) => {
      const found = c.find((i) => i.product_id === p.id);
      if (kind === "sale" && (found?.quantity || 0) >= p.stock) {
        notify("No more stock available");
        return c;
      }
      return found
        ? c.map((i) =>
            i.product_id === p.id
              ? { ...i, quantity: Number(i.quantity) + 1 }
              : i,
          )
        : [
            ...c,
            {
              product_id: p.id,
              quantity: 1,
              price: Number(
                kind === "sale" ? p.selling_price : p.purchase_price,
              ),
              discount: 0,
            },
          ];
    });
    setSearch("");
    requestAnimationFrame(() => scanInput.current?.focus());
  };
  const lines = cart.map((i) => {
    const p = products.data?.find((p) => p.id === i.product_id);
    const taxable =
      Math.round(Number(i.price) * 100) * Number(i.quantity) -
      Math.round(Number(i.discount) * 100);
    const tax = Math.round(
      (taxable * (settings.gst_enabled ? Number(p?.gst_rate || 0) : 0)) / 100,
    );
    return {
      ...i,
      p,
      taxable: taxable / 100,
      tax: tax / 100,
      total: (taxable + tax) / 100,
    };
  });
  const subtotal = lines.reduce((s, i) => s + i.taxable, 0),
    tax = lines.reduce((s, i) => s + i.tax, 0),
    total = Math.round((subtotal + tax) * 100) / 100;
  const billPayments = resolvePayments(payments, total, automaticPayment);
  const changePayments = (next) => {
    setAutomaticPayment(false);
    setPayments(next);
  };
  const fillFullPayment = () => {
    setAutomaticPayment(true);
    setPayments([
      {
        method: billPayments[0]?.method || "Cash",
        amount: total,
        reference: billPayments[0]?.reference || "",
      },
    ]);
    setError("");
  };
  const changeMethod = (index, method) =>
    setPayments(
      billPayments.map((p, i) => (i === index ? { ...p, method } : p)),
    );
  const changeReference = (index, reference) =>
    setPayments(
      billPayments.map((p, i) => (i === index ? { ...p, reference } : p)),
    );
  const paid = billPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const cashAmount = billPayments
    .filter((p) => p.method === "Cash")
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const update = (id, k, v) =>
    setCart(cart.map((i) => (i.product_id === id ? { ...i, [k]: v } : i)));
  const reset = () => {
    setCart([]);
    setPayments([{ method: "Cash", amount: "", reference: "" }]);
    setAutomaticPayment(kind === "sale");
    setCash("");
    setParty("");
    setReference("");
    setHeldId(null);
    key.current = uid();
  };
  const complete = async () => {
    setBusy(true);
    setError("");
    try {
      const d = await api("/documents", {
        method: "POST",
        body: {
          kind,
          customer_id: kind === "sale" && party ? Number(party) : null,
          supplier_id: kind === "purchase" && party ? Number(party) : null,
          reference,
          items: cart,
          payments: billPayments.filter((p) => Number(p.amount) > 0),
          idempotency_key: key.current,
        },
      });
      if (heldId) {
        try {
          await api("/held/" + heldId, { method: "DELETE" });
        } catch {
          notify("Sale completed. Remove the old held bill manually.");
        }
      }
      reset();
      products.load();
      held.load();
      setPreview(false);
      notify(
        kind === "sale"
          ? "Sale completed. Stock updated."
          : "Purchase received. Stock updated.",
      );
      if (onComplete) onComplete(d.id);
      else setInvoice(d.id);
    } catch (e) {
      setError(e.message);
      setPreview(false);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      {!embedded && (
        <PageTitle
          title="Let’s make a sale."
          description="Retail counter billing · Scan one piece, collect payment, and print a receipt."
        >
          <Button
            variant="secondary"
            icon={Pause}
            onClick={() => setShowHeld(true)}
          >
            Held bills ({held.data?.length || 0})
          </Button>
        </PageTitle>
      )}
      <ErrorBox error={error || products.error || parties.error} />
      <div className={"pos-layout " + (kind === "sale" ? "scan-only" : "")}>
        {kind === "sale" ? (
          <ScannedItemsPanel
            products={products}
            scanInput={scanInput}
            add={add}
            setError={setError}
            cart={cart}
            lines={lines}
            setCart={setCart}
            update={update}
            user={user}
          />
        ) : (
          <ProductCatalog
            scanInput={scanInput}
            products={products}
            search={search}
            setSearch={setSearch}
            add={add}
            setError={setError}
            list={list}
            kind={kind}
          />
        )}
        <section className="panel checkout">
          <div className="panel-heading">
            <div>
              <h2>{kind === "sale" ? "Current bill" : "Purchase entry"}</h2>
              <p>
                {cart.length} items in your{" "}
                {kind === "sale" ? "basket" : "delivery"}
              </p>
            </div>
            <ShoppingBag size={20} />
          </div>
          <div className="checkout-body">
            <Field
              label={
                kind === "sale"
                  ? "Customer (optional for full payment)"
                  : "Supplier"
              }
              options={[
                {
                  value: "",
                  label:
                    kind === "sale" ? "Walk-in customer" : "Select supplier",
                },
                ...(parties.data || [])
                  .filter((p) => p.active)
                  .map((p) => ({ value: p.id, label: p.name })),
              ]}
              value={party}
              onChange={(e) => setParty(e.target.value)}
            />
            {kind === "purchase" && (
              <Field
                label="Supplier invoice reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            )}
            {kind === "purchase" && (
              <CartItems
                cart={cart}
                lines={lines}
                setCart={setCart}
                update={update}
                kind={kind}
                user={user}
              />
            )}
            <BillTotals
              subtotal={subtotal}
              settings={settings}
              tax={tax}
              total={total}
            />
            <PaymentPanel
              payments={billPayments}
              setPayments={changePayments}
              onFullPayment={fillFullPayment}
              onMethodChange={changeMethod}
              onReferenceChange={changeReference}
              automaticPayment={automaticPayment}
              total={total}
              paid={paid}
              cashAmount={cashAmount}
              cash={cash}
              setCash={setCash}
            />{" "}
            <div className="checkout-actions">
              {kind === "sale" && (
                <Button
                  variant="secondary"
                  icon={Pause}
                  disabled={!cart.length}
                  onClick={async () => {
                    try {
                      const label = window.prompt(
                        "Name this held bill",
                        "Customer at counter",
                      );
                      if (!label) return;
                      await api("/held", {
                        method: "POST",
                        body: {
                          label,
                          data: {
                            items: cart,
                            customer_id: party ? Number(party) : null,
                          },
                        },
                      });
                      reset();
                      held.load();
                      notify("Bill held. Stock is unchanged.");
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  Hold
                </Button>
              )}
              <Button
                disabled={!cart.length || busy}
                icon={ArrowUpRight}
                onClick={() => {
                  setError("");
                  if (
                    lines.some(
                      (i) =>
                        i.quantity < 1 ||
                        !Number.isInteger(Number(i.quantity)) ||
                        i.taxable < 0,
                    )
                  ) {
                    setError("Check quantities and discounts");
                    return;
                  }
                  if (paid > total + 0.001) {
                    setError(
                      "Payment exceeds total. Record only the amount after cash change.",
                    );
                    return;
                  }
                  const paymentError = walkInPaymentError({
                    kind,
                    customerId: party,
                    total,
                    paid,
                  });
                  if (paymentError) {
                    setError(paymentError);
                    return;
                  }
                  if (cash && Number(cash) < cashAmount) {
                    setError("Cash tendered is less than the cash payment");
                    return;
                  }
                  setPreview(true);
                }}
              >
                Review {kind}
              </Button>
            </div>
          </div>
        </section>
      </div>
      {preview && (
        <BillReviewDialog
          kind={kind}
          busy={busy}
          setPreview={setPreview}
          lines={lines}
          total={total}
          paid={paid}
          complete={complete}
        />
      )}
      {showHeld && (
        <HeldBillsDialog
          setShowHeld={setShowHeld}
          held={held}
          cart={cart}
          setCart={setCart}
          setParty={setParty}
          setHeldId={setHeldId}
          setPayments={(next) => {
            setPayments(next);
            setAutomaticPayment(kind === "sale");
          }}
          submissionKey={key}
        />
      )}
      {invoice && <Invoice id={invoice} onClose={() => setInvoice(null)} />}
    </>
  );
}
