import React from "react";
import { ReadOnlyPage } from "../records/LedgerPage.jsx";

const config = {
  title: "Returns & refunds",
  description: "Every return connected to its original invoice.",
  columns: [
    ["number", "Invoice"],
    ["kind", "Type"],
    ["product_name", "Product"],
    ["quantity", "Quantity"],
    ["amount", "Amount"],
    ["condition", "Condition"],
    ["reason", "Reason"],
  ],
};

export function ReturnsPage() {
  return <ReadOnlyPage type="returns" config={config} />;
}
