import React from "react";
import { Records } from "../records/RecordsPage.jsx";

const config = {
  title: "Categories",
  singular: "category",
  description: "Give every product a place to belong.",
  fields: [["name", "Category name"]],
};

export function CategoriesPage() {
  return <Records type="categories" config={config} />;
}
