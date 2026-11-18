import { Badge } from "../../../components/ui/Badge.jsx";
import { fmt } from "../../../lib/format.js";
import React from "react";

export function SalesPerformance({ chart, max }) {
  return (
    <section className="panel performance">
      <div className="panel-heading">
        <div>
          <h2>Sales performance</h2>
          <p>A little perspective on your week</p>
        </div>
        <Badge tone="neutral">Last 7 days</Badge>
      </div>
      <div className="chart-total">
        {fmt(chart.reduce((s, c) => s + c.total, 0))}
        <span>Total sales</span>
      </div>
      <div className="chart">
        <div className="chart-lines">
          <span>{fmt(max)}</span>
          <span>{fmt(max / 2)}</span>
          <span>₹0</span>
        </div>
        {chart.map((c, i) => (
          <div className="bar-group" key={i}>
            <div
              className={"bar " + (i === 6 ? "last" : "")}
              style={{ height: Math.max((c.total / max) * 150, 3) }}
              title={`${c.label}: ${fmt(c.total)}`}
            />
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
