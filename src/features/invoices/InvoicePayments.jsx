import { date, fmt } from "../../lib/format.js";
import React from "react";

export function InvoicePayments({ d }) {
  return (
    <div className="invoice-payments">
      <h3>Payment history</h3>
      {d.payments.length ? (
        d.payments.map((p) => (
          <div key={p.id}>
            <span>
              {date(p.created_at)} · {p.method} {p.is_refund ? "· Refund" : ""}
              <small>{p.reference}</small>
            </span>
            <strong>
              {p.is_refund ? "−" : ""}
              {fmt(p.amount)}
            </strong>
          </div>
        ))
      ) : (
        <p className="muted">No payment recorded.</p>
      )}
    </div>
  );
}
