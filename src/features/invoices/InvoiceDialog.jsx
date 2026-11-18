import { InvoiceActionDialog } from "./InvoiceActionDialog.jsx";
import { InvoicePayments } from "./InvoicePayments.jsx";
import { InvoiceReceipt } from "./InvoiceReceipt.jsx";
import { flushSync } from "react-dom";
import { printElement } from "../../lib/printing.js";
import { Download, Printer } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { useData } from "../../hooks/useData.js";
import React, { useState, useRef } from "react";
import { uid } from "../../lib/format.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { Loading } from "../../components/ui/Loading.jsx";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { can } from "../../lib/permissions.js";
import { Button } from "../../components/ui/Button.jsx";
import { api } from "../../lib/api.js";
import { Field } from "../../components/ui/Field.jsx";

export function Invoice({ id, onClose }) {
  const { settings, user, notify } = useApp(),
    { data: d, loading, error, load } = useData("/documents/" + id);
  const [action, setAction] = useState(null),
    [form, setForm] = useState({}),
    [formError, setFormError] = useState(""),
    [busy, setBusy] = useState(false),
    [duplicate, setDuplicate] = useState(false);
  const actionKey = useRef(uid());
  const receiptRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [paper, setPaper] = useState(null);
  if (loading && !d)
    return (
      <Modal title="Invoice" onClose={onClose}>
        <Loading />
      </Modal>
    );
  if (!d)
    return (
      <Modal title="Invoice" onClose={onClose}>
        <ErrorBox error={error} />
      </Modal>
    );
  const paid = d.payments.reduce(
      (s, p) => s + (p.is_refund ? -1 : 1) * Number(p.amount),
      0,
    ),
    returned = d.returns.reduce((s, r) => s + Number(r.amount), 0),
    due = d.status === "cancelled" ? 0 : Number(d.total) - returned - paid;
  const open = (a) => {
    actionKey.current = uid();
    setAction(a);
    setFormError("");
    setForm({
      amount: Math.max(due, 0),
      method: "Cash",
      reference: "",
      item_id: d.items.find((i) => i.returned < i.quantity)?.id || "",
      quantity: 1,
      reason: "",
      condition: "sellable",
    });
  };
  const outputSettings = {
    ...settings,
    paper: paper || settings.paper || "A4",
  };
  const outputInvoice = async (mode) => {
    setExporting(true);
    try {
      const pdfModule =
        mode === "download" ? await import("./invoicePdf.js") : null;
      const result = await api("/documents/" + id + "/print", {
        method: "POST",
      });
      flushSync(() => setDuplicate(result.duplicate));
      if (pdfModule)
        pdfModule.downloadInvoice(d, outputSettings, result.duplicate);
      else
        printElement(receiptRef.current.firstElementChild, {
          paper: outputSettings.paper,
          title: d.number,
        });
    } catch (e) {
      notify(e.message);
    } finally {
      setExporting(false);
    }
  };
  return (
    <Modal title={d.number} onClose={onClose} wide>
      <ErrorBox error={error} />
      <div className="invoice-output-options">
        <Field
          label="Receipt paper"
          options={["A4", "80mm"]}
          value={outputSettings.paper}
          onChange={(e) => setPaper(e.target.value)}
        />
        <p>Download a PDF directly, or print only this retail receipt.</p>
      </div>
      <div ref={receiptRef}>
        <InvoiceReceipt
          invoice={d}
          settings={outputSettings}
          duplicate={duplicate}
        />
      </div>
      <InvoicePayments d={d} />
      <div className="modal-actions wrap">
        {can(user, "reprint") && (
          <>
            <Button
              icon={Download}
              disabled={exporting}
              onClick={() => outputInvoice("download")}
            >
              {exporting ? "Preparing…" : "Download PDF"}
            </Button>
            <Button
              variant="secondary"
              icon={Printer}
              disabled={exporting}
              onClick={() => outputInvoice("print")}
            >
              Print receipt
            </Button>
          </>
        )}
        {d.status === "completed" && (
          <>
            {due > 0 && (
              <Button variant="secondary" onClick={() => open("payments")}>
                Record payment
              </Button>
            )}
            {can(user, d.kind === "sale" ? "returns" : "purchases") &&
              d.items.some((i) => i.returned < i.quantity) && (
                <Button variant="secondary" onClick={() => open("returns")}>
                  Return items
                </Button>
              )}
            {user.role === "admin" && !d.returns.length && (
              <Button variant="danger" onClick={() => open("cancel")}>
                Cancel invoice
              </Button>
            )}
          </>
        )}
      </div>
      {action && (
        <InvoiceActionDialog
          action={action}
          busy={busy}
          setAction={setAction}
          setBusy={setBusy}
          id={id}
          form={form}
          actionKey={actionKey}
          load={load}
          notify={notify}
          setFormError={setFormError}
          due={due}
          setForm={setForm}
          d={d}
          formError={formError}
        />
      )}
    </Modal>
  );
}
