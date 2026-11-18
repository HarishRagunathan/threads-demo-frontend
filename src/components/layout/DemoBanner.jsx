import { ShieldCheck } from "lucide-react";
import React from "react";

export function DemoBanner({}) {
  return (
    <div className="demo-strip">
      <span>
        <ShieldCheck size={14} /> Demo workspace · Fictional shop data
      </span>
      <span>Payments are simulated · GST is illustrative</span>
    </div>
  );
}
