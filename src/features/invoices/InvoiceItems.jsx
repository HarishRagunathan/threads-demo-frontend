import React from "react";
import { fmt } from "../../lib/format.js";

export function InvoiceItems({ items, thermal = false }) {
  if (thermal)
    return (
      <table className="receipt-items">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>
                <strong>{i.product_name}</strong>
                <small>{i.product_code}</small>
                <small>{fmt(i.price)} / piece</small>
                <small>
                  Discount {fmt(i.discount)} · Demo GST {i.gst_rate}%:{" "}
                  {fmt(i.tax)}
                </small>
                {i.returned > 0 && <small>{i.returned} returned</small>}
              </td>
              <td>{i.quantity}</td>
              <td>{fmt(i.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  return (
    <table className="receipt-items">
      <thead>
        <tr>
          <th>Product / code</th>
          <th>HSN</th>
          <th>Qty (pcs)</th>
          <th>Unit price</th>
          <th>Discount</th>
          <th>Demo GST</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((i) => (
          <tr key={i.id}>
            <td>
              <strong>{i.product_name}</strong>
              <small>{i.product_code}</small>
            </td>
            <td>{i.hsn || "—"}</td>
            <td>
              {i.quantity}
              {i.returned > 0 && <small>{i.returned} returned</small>}
            </td>
            <td>{fmt(i.price)}</td>
            <td>{fmt(i.discount)}</td>
            <td>
              {i.gst_rate}%<small>{fmt(i.tax)}</small>
            </td>
            <td>{fmt(i.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
