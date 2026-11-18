import React from "react";
import { Records } from "../records/RecordsPage.jsx";

const config = {
  title: "Brands",
  singular: "brand",
  description: "Manage the labels in your collection.",
  fields: [["name", "Brand name"]],
};

export function BrandsPage() {
  return <Records type="brands" config={config} />;
}
