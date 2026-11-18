import React from "react";
import { Records } from "../records/RecordsPage.jsx";

const config = {
  title: "Customers",
  singular: "customer",
  description: "A familiar face behind every purchase.",
  fields: [
    ["name", "Customer name"],
    ["mobile", "Mobile number"],
    ["email", "Email address", "email"],
    ["address", "Address", "textarea"],
  ],
};

export function CustomersPage() {
  return <Records type="customers" config={config} />;
}
