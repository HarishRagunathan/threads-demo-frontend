import React from "react";
import { ReadOnlyPage } from "../records/LedgerPage.jsx";

const config = {
  title: "Payment ledger",
  description: "Cash, UPI, card, and simulated gateway records.",
  columns: [
    ["number", "Invoice"],
    ["kind", "Type"],
    ["method", "Method"],
    ["amount", "Amount"],
    ["is_refund", "Refund"],
    ["reference", "Reference"],
  ],
};

export function PaymentsPage() {
  return <ReadOnlyPage type="payments" config={config} />;
}
