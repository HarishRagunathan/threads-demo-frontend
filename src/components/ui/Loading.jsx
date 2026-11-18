import { RefreshCw } from "lucide-react";
import React from "react";

export function Loading() {
  return (
    <div className="empty">
      <RefreshCw className="spin" size={24} />
      <p>Loading your workspace…</p>
    </div>
  );
}
