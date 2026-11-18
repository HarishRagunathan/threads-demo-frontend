import React, { useState } from "react";
import { today, fmt, date } from "../../lib/format.js";
import { useData } from "../../hooks/useData.js";
import { PageTitle } from "../../components/ui/PageTitle.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Printer, Download, Search } from "lucide-react";
import { exportExcel } from "../../lib/export.js";
import { Field } from "../../components/ui/Field.jsx";
import { reportOptions } from "../../config/reports.js";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { Loading } from "../../components/ui/Loading.jsx";
import { Table } from "../../components/ui/Table.jsx";

export function Reports() {
  const [from, setFrom] = useState(today().slice(0, 8) + "01"),
    [to, setTo] = useState(today()),
    [type, setType] = useState("Daily sales"),
    [search, setSearch] = useState("");
  const { data, loading, error } = useData(`/reports?from=${from}&to=${to}`),
    products = useData("/products");
  let rows = [],
    columns = [];
  const defs = (pairs) =>
    pairs.map(([key, label]) => ({
      key,
      label,
      render: [
        "total",
        "amount",
        "revenue",
        "cost",
        "profit",
        "expenses",
        "value",
        "tax",
        "taxable",
        "net",
        "cash",
        "upi",
        "card",
        "gateway",
      ].includes(key)
        ? (r) => fmt(r[key])
        : undefined,
    }));
  if (data) {
    if (
      ["Daily sales", "Weekly sales", "Monthly sales", "Purchases"].includes(
        type,
      )
    ) {
      rows = data.docs.filter(
        (d) => d.kind === (type === "Purchases" ? "purchase" : "sale"),
      );
      columns = defs([
        ["number", "Invoice"],
        ["party", "Customer / supplier"],
        ["created_at", "Date"],
        ["total", "Amount"],
        ["status", "Status"],
      ]);
      columns[2].render = (r) => date(r.created_at);
    } else if (
      [
        "Product sales",
        "Staff sales",
        "Customer purchases",
        "Supplier purchases",
      ].includes(type)
    ) {
      const key =
        type === "Product sales"
          ? "product_name"
          : type === "Staff sales"
            ? "staff"
            : "party";
      const grouped = {};
      for (const i of data.items.filter(
        (i) => i.kind === (type === "Supplier purchases" ? "purchase" : "sale"),
      )) {
        const k = i[key];
        grouped[k] ??= { name: k, quantity: 0, total: 0 };
        grouped[k].quantity += i.quantity;
        grouped[k].total += Number(i.total);
      }
      rows = Object.values(grouped);
      columns = defs([
        ["name", type.replace(" sales", "").replace(" purchases", "")],
        ["quantity", "Gross quantity"],
        ["total", "Gross invoice amount"],
      ]);
    } else if (["Stock", "Low stock"].includes(type)) {
      rows = (products.data || [])
        .filter((p) => type === "Stock" || p.stock <= p.min_stock)
        .map((p) => ({ ...p, value: p.stock * p.purchase_price }));
      columns = defs([
        ["name", "Product"],
        ["code", "Code"],
        ["stock", "Stock"],
        ["min_stock", "Minimum"],
        ["value", "Current cost value"],
      ]);
    } else if (["Stock movements", "Damaged stock"].includes(type)) {
      rows = data.movements.filter(
        (m) =>
          type === "Stock movements" ||
          m.reason.toLowerCase().includes("damaged"),
      );
      if (type === "Damaged stock")
        rows = [
          ...rows,
          ...data.returns
            .filter((r) => r.condition === "damaged")
            .map((r) => ({
              product: r.product_name,
              quantity: r.quantity,
              reason: "Damaged return: " + r.reason,
            })),
        ];
      columns = defs([
        ["product", "Product"],
        ["quantity", "Quantity"],
        ["reason", "Reason"],
      ]);
    } else if (type === "Expenses") {
      rows = data.expenses;
      columns = defs([
        ["date", "Date"],
        ["category", "Category"],
        ["description", "Description"],
        ["amount", "Amount"],
        ["method", "Method"],
      ]);
    } else if (["Payments", "Refunds"].includes(type)) {
      rows = data.payments.filter((p) => type === "Payments" || p.is_refund);
      columns = defs([
        ["number", "Invoice"],
        ["kind", "Type"],
        ["method", "Method"],
        ["amount", "Amount"],
        ["reference", "Reference"],
      ]);
    } else if (["Sales returns", "Purchase returns"].includes(type)) {
      rows = data.returns.filter(
        (r) => r.kind === (type === "Sales returns" ? "sale" : "purchase"),
      );
      columns = defs([
        ["number", "Invoice"],
        ["product_name", "Product"],
        ["quantity", "Returned"],
        ["amount", "Amount"],
        ["reason", "Reason"],
      ]);
    } else if (type === "Demo GST") {
      rows = [
        ...data.items.map((i) => ({
          number: i.number,
          kind: i.kind,
          hsn: i.hsn,
          rate: i.gst_rate,
          taxable: i.taxable,
          tax: i.tax,
        })),
        ...data.returns.map((r) => ({
          number: r.number,
          kind: r.kind + " return",
          hsn: "—",
          rate: "—",
          taxable: (-Number(r.taxable) * r.quantity) / r.original_quantity,
          tax: (-Number(r.tax) * r.quantity) / r.original_quantity,
        })),
      ];
      columns = defs([
        ["number", "Invoice"],
        ["kind", "Type"],
        ["hsn", "HSN"],
        ["rate", "Demo rate %"],
        ["taxable", "Taxable amount"],
        ["tax", "Demo tax"],
      ]);
    } else if (type === "Profit") {
      rows = [data.profit];
      columns = defs([
        ["revenue", "Net revenue ex. GST"],
        ["cogs", "Cost of goods"],
        ["expenses", "Expenses"],
        ["profit", "Profit"],
      ]);
      columns[1].render = (r) => fmt(r.cogs);
    } else {
      const group = {};
      for (const p of data.payments) {
        const day = new Date(p.created_at).toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        });
        group[day] ??= { day, cash: 0, upi: 0, card: 0, gateway: 0, net: 0 };
        const k = {
          Cash: "cash",
          UPI: "upi",
          Card: "card",
          "Demo gateway": "gateway",
        }[p.method];
        const amount =
          Number(p.amount) *
          (p.is_refund ? -1 : 1) *
          (p.kind === "purchase" ? -1 : 1);
        group[day][k] += amount;
        group[day].net += amount;
      }
      rows = Object.values(group);
      columns = defs([
        ["day", "Day"],
        ["cash", "Net cash"],
        ["upi", "Net UPI"],
        ["card", "Net card"],
        ["gateway", "Demo gateway"],
        ["net", "Net collections"],
      ]);
    }
  }
  rows = rows.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="The bigger picture."
        description="Turn everyday transactions into a clearer view of your business."
      >
        <Button
          variant="secondary"
          icon={Printer}
          onClick={() => window.print()}
        >
          Print / PDF
        </Button>
        <Button icon={Download} onClick={() => exportExcel(rows, type)}>
          Export Excel
        </Button>
      </PageTitle>
      <div className="report-filters">
        <Field
          label="Report"
          options={reportOptions}
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            if (e.target.value === "Weekly sales") {
              const d = new Date();
              d.setDate(d.getDate() - 6);
              setFrom(
                d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
              );
              setTo(today());
            }
            if (e.target.value === "Daily sales") {
              setFrom(today());
              setTo(today());
            }
            if (e.target.value === "Monthly sales") {
              setFrom(today().slice(0, 8) + "01");
              setTo(today());
            }
          }}
        />
        <Field
          label="From"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Field
          label="To"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <ErrorBox error={error} />
      {type === "Profit" && (
        <div className="info-note">{data?.profit.method}</div>
      )}
      {type === "Demo GST" && (
        <div className="info-note">
          Illustrative GST only. Not suitable for filing tax returns.
        </div>
      )}
      <section className="panel print-area">
        <div className="panel-heading">
          <div>
            <h2>{type}</h2>
            <p>
              {from} to {to}
              {["Stock", "Low stock"].includes(type)
                ? " · Current stock snapshot"
                : ""}
            </p>
          </div>
          <div className="search">
            <Search size={16} />
            <input
              placeholder="Search report"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {loading ? <Loading /> : <Table rows={rows} columns={columns} />}
      </section>
    </>
  );
}
