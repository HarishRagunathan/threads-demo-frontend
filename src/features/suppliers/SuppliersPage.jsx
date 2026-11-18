import React from "react";
import { Records } from "../records/RecordsPage.jsx";

const config = {
  title: "Suppliers",
  singular: "supplier",
  description: "The people who keep your shelves full.",
  fields: [
    ["name", "Supplier name"],
    ["contact_person", "Contact person"],
    ["mobile", "Mobile number"],
    ["email", "Email address", "email"],
    ["address", "Address", "textarea"],
    ["gstin", "GSTIN · demo"],
  ],
};

export function SuppliersPage() {
  return <Records type="suppliers" config={config} />;
}
