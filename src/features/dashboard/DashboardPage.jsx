import { QuickActions } from "./components/QuickActions.jsx";
import { SalesPerformance } from "./components/SalesPerformance.jsx";
import { DashboardStats } from "./components/DashboardStats.jsx";
import { useApp } from "../../context/AppContext.jsx";
import React, { useState } from "react";
import { today, fmt } from "../../lib/format.js";
import { useData } from "../../hooks/useData.js";
import { Loading } from "../../components/ui/Loading.jsx";
import { can } from "../../lib/permissions.js";
import {
  Receipt,
  ShoppingBag,
  Truck,
  Wallet,
  Boxes,
  Plus,
  Shirt,
  ArrowUpRight,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { PageTitle } from "../../components/ui/PageTitle.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { Empty } from "../../components/ui/Empty.jsx";

export function Dashboard() {
  const { user, go } = useApp();
  const [day, setDay] = useState(today());
  const { data, loading, error } = useData("/dashboard?date=" + day);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const s = data?.summary || {};
  const admin = user.role === "admin" || can(user, "reports");
  const cards = [
    ["Sales", s.sales, Receipt, "Revenue for selected day"],
    ["Bills completed", s.bills, ShoppingBag, "Completed invoices", true],
    ...(admin
      ? [
          ["Purchases", s.purchases, Truck, "Stock received"],
          ["Expenses", s.expenses, Wallet, "Recorded expenses"],
          ["Stock value", s.stock_value, Boxes, "At weighted-average cost"],
        ]
      : []),
  ];
  const chart = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(day + "T12:00:00");
    d.setDate(d.getDate() - 6 + i);
    const key = d.toISOString().slice(0, 10);
    return {
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      total: Number(
        data?.chart.find((c) => c.day.slice(0, 10) === key)?.total || 0,
      ),
    };
  });
  const max = Math.max(...chart.map((c) => c.total), 100);
  return (
    <>
      <PageTitle
        title={"A fresh view of your shop."}
        description={`Welcome back, ${user.name.split(" ")[0]}. Here’s how things are looking.`}
      >
        <input
          aria-label="Dashboard date"
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
        {can(user, "sales") && (
          <Button icon={Plus} onClick={() => go("pos")}>
            New sale
          </Button>
        )}
      </PageTitle>
      <ErrorBox error={error} />
      <DashboardStats cards={cards} />
      <div className="dashboard-grid">
        <SalesPerformance chart={chart} max={max} />
        <QuickActions user={user} go={go} />
      </div>
      <div className="dashboard-grid lower">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent transactions</h2>
              <p>The latest activity at your counter</p>
            </div>
            {can(user, "sales") && (
              <button className="text-button" onClick={() => go("sales")}>
                View all <ArrowUpRight size={15} />
              </button>
            )}
          </div>
          <Table
            columns={[
              {
                key: "number",
                label: "Invoice",
                render: (r) => <strong>{r.number}</strong>,
              },
              { key: "party", label: "Customer / supplier" },
              {
                key: "kind",
                label: "Type",
                render: (r) => (
                  <Badge tone={r.kind === "sale" ? "green" : "neutral"}>
                    {r.kind}
                  </Badge>
                ),
              },
              { key: "total", label: "Amount", render: (r) => fmt(r.total) },
            ]}
            rows={data?.recent || []}
          />
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Needs a little attention</h2>
              <p>Products at or below minimum stock</p>
            </div>
            <span className="alert-icon">
              <AlertTriangle size={18} />
            </span>
          </div>
          <div className="low-list">
            {data?.low.length ? (
              data.low.map((p) => (
                <div className="low-item" key={p.id}>
                  <span className="product-icon">
                    <Shirt size={20} />
                  </span>
                  <div>
                    <strong>{p.name}</strong>
                    <small>{p.code}</small>
                  </div>
                  <Badge tone="amber">{p.stock} left</Badge>
                </div>
              ))
            ) : (
              <Empty
                text="Shelves are looking good"
                detail="No low stock alerts right now."
              />
            )}
          </div>
          {can(user, "stock") && (
            <button className="panel-link" onClick={() => go("inventory")}>
              Manage inventory <ChevronRight size={16} />
            </button>
          )}
        </section>
      </div>
    </>
  );
}
