import React from "react";
import { X } from "lucide-react";
import { Field } from "../../../components/ui/Field.jsx";
import { fmt } from "../../../lib/format.js";

export function PaymentPanel({
  payments,
  setPayments,
  total,
  paid,
  cashAmount,
  cash,
  setCash,
  onFullPayment,
  onMethodChange,
  onReferenceChange,
  automaticPayment,
}) {
  return (
    <>
      {" "}
      <div className="payment-title">
        <strong>Payment</strong>
        <button
          className="text-button"
          onClick={() =>
            setPayments([
              ...payments,
              { method: "UPI", amount: "", reference: "" },
            ])
          }
        >
          + Split payment
        </button>
      </div>
      {automaticPayment && (
        <p className="payment-default-note">
          Full bill amount is filled automatically. Confirm after collecting
          payment.
        </p>
      )}
      {payments.map((p, index) => (
        <div className="payment-row" key={index}>
          <select
            aria-label="Payment method"
            value={p.method}
            onChange={(e) => onMethodChange(index, e.target.value)}
          >
            {["Cash", "UPI", "Card", "Demo gateway"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <input
            aria-label="Payment amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount"
            value={p.amount}
            onChange={(e) =>
              setPayments(
                payments.map((p, i) =>
                  i === index ? { ...p, amount: e.target.value } : p,
                ),
              )
            }
          />
          <button
            className="icon-button"
            title="Remove payment"
            onClick={() => setPayments(payments.filter((_, i) => i !== index))}
          >
            <X size={14} />
          </button>
          {p.method !== "Cash" && (
            <input
              className="payment-reference"
              placeholder="Demo payment reference (optional)"
              value={p.reference}
              onChange={(e) => onReferenceChange(index, e.target.value)}
            />
          )}
        </div>
      ))}
      <button className="text-button" onClick={onFullPayment}>
        Fill full amount
      </button>
      {cashAmount > 0 && (
        <div className="cash-change">
          <Field
            label="Cash tendered (optional)"
            type="number"
            min={cashAmount}
            value={cash}
            onChange={(e) => setCash(e.target.value)}
          />
          <span>
            Change:{" "}
            <strong>{fmt(Math.max(0, Number(cash) - cashAmount))}</strong>
          </span>
        </div>
      )}
      <div className="balance-line">
        Balance due <strong>{fmt(total - paid)}</strong>
      </div>
      {payments.some((p) => p.method !== "Cash") && (
        <div className="info-note compact">
          Simulation only. No gateway connection or money transfer.
        </div>
      )}
    </>
  );
}
