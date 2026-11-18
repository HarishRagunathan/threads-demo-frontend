import { Package } from "lucide-react";
import React from "react";

export function Empty({
  text = "Nothing here yet",
  detail = "Your records will appear here as you start working.",
}) {
  return (
    <div className="empty">
      <Package size={32} />
      <h3>{text}</h3>
      <p>{detail}</p>
    </div>
  );
}
