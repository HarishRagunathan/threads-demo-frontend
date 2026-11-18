import { InvoiceItems } from "./InvoiceItems.jsx";
import React from "react";
import { Badge } from "../../components/ui/Badge.jsx";
import { date, fmt } from "../../lib/format.js";
import { invoiceTotals } from "./invoiceTotals.js";

export function InvoiceReceipt({ invoice: d, settings, duplicate = false }) {
  const { paid, returned, due } = invoiceTotals(d);
  return (
    <article
      className={
        "invoice print-area " + (settings.paper === "80mm" ? "thermal" : "")
      }
    >
      <div className="invoice-header">
        <div>
          <span className="eyebrow">
            {d.kind === "sale" ? "RETAIL SALES INVOICE" : "PURCHASE RECORD"}
          </span>
          <h1>{settings.shop_name}</h1>
          <p>
            {settings.address}
            <br />
            {settings.mobile}
          </p>
        </div>
        <div>
          <Badge tone="amber">DEMO · NOT A TAX INVOICE</Badge>
          <h3>{d.number}</h3>
          <p>
            {date(d.created_at)}
            <br />
            {d.status.toUpperCase()}
            {duplicate ? " · DUPLICATE COPY" : ""}
          </p>
        </div>
      </div>
      <p className="invoice-party">
        <strong>{d.kind === "sale" ? "Customer" : "Supplier"}:</strong>{" "}
        {d.party || "Walk-in customer"}
        {d.staff && (
          <>
            <br />
            <strong>Billed by:</strong> {d.staff}
          </>
        )}
      </p>
      <p className="muted">
        GSTIN: {settings.gstin || "Demo only"} ·{" "}
        {d.reference && "Reference: " + d.reference}
      </p>
      <InvoiceItems items={d.items} thermal={settings.paper === "80mm"} />
      <div className="invoice-summary">
        <div>
          <span>Taxable amount</span>
          <strong>{fmt(d.subtotal)}</strong>
        </div>
        {d.tax_mode === "inter" ? (
          <div>
            <span>Demo IGST</span>
            <strong>{fmt(d.tax)}</strong>
          </div>
        ) : (
          <>
            <div>
              <span>Demo CGST</span>
              <strong>{fmt(Math.round(Number(d.tax) * 50) / 100)}</strong>
            </div>
            <div>
              <span>Demo SGST</span>
              <strong>
                {fmt(Number(d.tax) - Math.round(Number(d.tax) * 50) / 100)}
              </strong>
            </div>
          </>
        )}
        <div className="grand-total">
          <span>Total</span>
          <strong>{fmt(d.total)}</strong>
        </div>
        <div>
          <span>Returns</span>
          <strong>{fmt(returned)}</strong>
        </div>
        <div>
          <span>Net payments</span>
          <strong>{fmt(paid)}</strong>
        </div>
        <div>
          <span>Balance due</span>
          <strong>{fmt(due)}</strong>
        </div>
      </div>
      <div className="invoice-footer">
        {settings.footer}
        <br />
        All payments are demo records. No actual payment processing.
      </div>
    </article>
  );
}
