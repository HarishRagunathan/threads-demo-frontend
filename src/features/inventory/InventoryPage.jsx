import { useApp } from "../../context/AppContext.jsx";
import { useData } from "../../hooks/useData.js";
import React, { useState } from "react";
import { PageTitle } from "../../components/ui/PageTitle.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Download, Search } from "lucide-react";
import { exportExcel } from "../../lib/export.js";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { date, fmt } from "../../lib/format.js";
import { Badge } from "../../components/ui/Badge.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { api } from "../../lib/api.js";
import { Field } from "../../components/ui/Field.jsx";

export function Inventory() {
  const { notify } = useApp(),
    products = useData("/products"),
    movements = useData("/stock");
  const [tab, setTab] = useState("stock"),
    [search, setSearch] = useState(""),
    [adjust, setAdjust] = useState(null),
    [error, setError] = useState("");
  const rows = (products.data || []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (tab !== "low" || p.stock <= p.min_stock),
  );
  return (
    <>
      <PageTitle
        title="Inventory, in balance."
        description="Know what’s on the shelf, and how it got there."
      >
        <Button
          variant="secondary"
          icon={Download}
          onClick={() =>
            exportExcel(
              tab === "movements" ? movements.data || [] : rows,
              "inventory",
            )
          }
        >
          Export
        </Button>
      </PageTitle>
      <div className="tabs">
        {[
          ["stock", "Current stock"],
          ["low", "Low stock"],
          ["movements", "Movement history"],
        ].map(([v, l]) => (
          <button
            key={v}
            className={tab === v ? "selected" : ""}
            onClick={() => setTab(v)}
          >
            {l}
          </button>
        ))}
      </div>
      <ErrorBox error={products.error || movements.error} />
      <section className="panel">
        <div className="toolbar">
          <div className="search">
            <Search size={17} />
            <input
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {tab === "movements" ? (
          <Table
            rows={(movements.data || []).filter((m) =>
              m.product.toLowerCase().includes(search.toLowerCase()),
            )}
            columns={[
              {
                key: "created_at",
                label: "Date",
                render: (r) => date(r.created_at),
              },
              { key: "product", label: "Product" },
              {
                key: "quantity",
                label: "Change",
                render: (r) => (
                  <Badge tone={r.quantity > 0 ? "green" : "amber"}>
                    {r.quantity > 0 ? "+" : ""}
                    {r.quantity}
                  </Badge>
                ),
              },
              { key: "reason", label: "Reason" },
              { key: "staff", label: "Recorded by" },
            ]}
          />
        ) : (
          <Table
            rows={rows}
            columns={[
              { key: "name", label: "Product" },
              { key: "code", label: "Code" },
              { key: "stock", label: "Available" },
              { key: "min_stock", label: "Minimum" },
              {
                key: "value",
                label: "Cost value",
                render: (p) => fmt(p.stock * p.purchase_price),
              },
              {
                key: "action",
                label: "",
                render: (p) => (
                  <button
                    className="text-button"
                    onClick={() => {
                      setError("");
                      setAdjust({
                        product_id: p.id,
                        name: p.name,
                        quantity: "",
                        reason: "",
                      });
                    }}
                  >
                    Adjust stock
                  </button>
                ),
              },
            ]}
          />
        )}
      </section>
      {adjust && (
        <Modal
          title={"Adjust · " + adjust.name}
          onClose={() => setAdjust(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api("/stock/adjust", { method: "POST", body: adjust });
                setAdjust(null);
                products.load();
                movements.load();
                notify("Stock adjustment recorded");
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            <div className="info-note">
              Use a negative quantity to remove stock. For damage, include
              “Damaged” in the reason.
            </div>
            <Field
              label="Quantity change"
              type="number"
              step="1"
              required
              value={adjust.quantity}
              onChange={(e) =>
                setAdjust({ ...adjust, quantity: e.target.value })
              }
            />
            <Field
              label="Reason"
              required
              minLength={3}
              value={adjust.reason}
              onChange={(e) => setAdjust({ ...adjust, reason: e.target.value })}
            />
            <ErrorBox error={error} />
            <div className="modal-actions">
              <Button>Record adjustment</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
