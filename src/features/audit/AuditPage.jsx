import React from "react";
import { ReadOnlyPage } from "../records/LedgerPage.jsx";

const config = {
  title: "Activity log",
  description: "A traceable history of changes across your shop.",
  columns: [
    ["staff", "User"],
    ["action", "Action"],
    ["entity", "Module"],
    ["entity_id", "Record"],
    ["detail", "Details"],
  ],
};

export function AuditPage() {
  return <ReadOnlyPage type="audit" config={config} />;
}
