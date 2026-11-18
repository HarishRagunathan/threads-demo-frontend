import { date, fmt } from "../../lib/format.js";
import { Badge } from "../ui/Badge.jsx";
import React from "react";

export const docColumns = [
  {
    key: "number",
    label: "Invoice",
    render: (r) => <strong>{r.number}</strong>,
  },
  { key: "created_at", label: "Date", render: (r) => date(r.created_at) },
  { key: "party", label: "Customer / supplier" },
  { key: "total", label: "Total", render: (r) => fmt(r.total) },
  {
    key: "due",
    label: "Balance",
    render: (r) =>
      fmt(
        r.status === "cancelled"
          ? 0
          : Number(r.total) -
              Number(r.returned_amount || 0) -
              Number(r.paid || 0),
      ),
  },
  {
    key: "status",
    label: "Status",
    render: (r) => (
      <Badge tone={r.status === "completed" ? "green" : "neutral"}>
        {r.status}
      </Badge>
    ),
  },
];
