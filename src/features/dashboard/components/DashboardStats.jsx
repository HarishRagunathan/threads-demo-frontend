import { fmt } from "../../../lib/format.js";
import React from "react";

export function DashboardStats({ cards }) {
  return (
    <div className="stats">
      {cards.map(([label, value, Icon, sub, count]) => (
        <div className="stat" key={label}>
          <div>
            <span>{label}</span>
            <Icon size={18} />
          </div>
          <strong>{count ? value || 0 : fmt(value)}</strong>
          <small>{sub}</small>
        </div>
      ))}
    </div>
  );
}
