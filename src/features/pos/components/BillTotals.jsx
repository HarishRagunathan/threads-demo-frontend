import { fmt } from "../../../lib/format.js";
import React from "react";

export function BillTotals({ subtotal, settings, tax, total }) {
  return (
    <div className="bill-totals">
      <div>
        <span>Taxable subtotal</span>
        <span>{fmt(subtotal)}</span>
      </div>
      {settings.tax_mode === "inter" ? (
        <div>
          <span>Demo IGST</span>
          <span>{fmt(tax)}</span>
        </div>
      ) : (
        <>
          <div>
            <span>Demo CGST</span>
            <span>{fmt(Math.round(tax * 50) / 100)}</span>
          </div>
          <div>
            <span>Demo SGST</span>
            <span>{fmt(tax - Math.round(tax * 50) / 100)}</span>
          </div>
        </>
      )}
      <div className="grand-total">
        <strong>Total</strong>
        <strong>{fmt(total)}</strong>
      </div>
    </div>
  );
}
