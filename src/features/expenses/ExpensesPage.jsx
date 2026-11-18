import React from "react";
import { Records } from "../records/RecordsPage.jsx";

const config = {
  title: "Expenses",
  singular: "expense",
  description: "Keep track of the cost of running your shop.",
  fields: [
    [
      "category",
      "Category",
      "select",
      [
        "Rent",
        "Electricity",
        "Salary",
        "Transport",
        "Maintenance",
        "Other Expenses",
      ],
    ],
    ["description", "Description"],
    ["amount", "Amount", "number"],
    ["date", "Date", "date"],
    [
      "method",
      "Payment method",
      "select",
      ["Cash", "UPI", "Card", "Demo gateway"],
    ],
    ["notes", "Notes", "textarea"],
  ],
};

export function ExpensesPage() {
  return <Records type="expenses" config={config} />;
}
