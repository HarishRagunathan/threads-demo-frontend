import { useData } from "../../hooks/useData.js";
import React, { useState } from "react";
import { PageTitle } from "../../components/ui/PageTitle.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Download, Search } from "lucide-react";
import { exportExcel } from "../../lib/export.js";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { Loading } from "../../components/ui/Loading.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { date, fmt } from "../../lib/format.js";
import { Badge } from "../../components/ui/Badge.jsx";
import { Invoice } from "../invoices/InvoiceDialog.jsx";

export function ReadOnlyPage({ type, config }) {
  const { data, loading, error } = useData("/" + type);
  const [search, setSearch] = useState(""),
    [invoice, setInvoice] = useState(null);
  const rows = (data || []).filter((r) =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle title={config.title} description={config.description}>
        <Button
          variant="secondary"
          icon={Download}
          onClick={() => exportExcel(rows, type)}
        >
          Export
        </Button>
      </PageTitle>
      <ErrorBox error={error} />
      {type === "returns" && (
        <div className="info-note">
          Open a completed sale or purchase invoice to create a validated
          return. Refunds are recorded automatically when payments exceed the
          revised invoice balance.
        </div>
      )}
      <section className="panel">
        <div className="toolbar">
          <div className="search">
            <Search size={17} />
            <input
              placeholder="Search records"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <Loading />
        ) : (
          <Table
            rows={rows}
            onRow={
              type !== "audit" ? (r) => setInvoice(r.document_id) : undefined
            }
            columns={[
              {
                key: "created_at",
                label: "Date",
                render: (r) => date(r.created_at),
              },
              ...config.columns.map(([key, label]) => ({
                key,
                label,
                render:
                  key === "amount"
                    ? (r) => fmt(r.amount)
                    : key === "is_refund"
                      ? (r) => (
                          <Badge tone={r.is_refund ? "amber" : "green"}>
                            {r.is_refund ? "Refund" : "Payment"}
                          </Badge>
                        )
                      : key === "detail"
                        ? (r) => (
                            <span className="audit-detail">
                              {JSON.stringify(r.detail)}
                            </span>
                          )
                        : undefined,
              })),
            ]}
          />
        )}
      </section>
      {invoice && <Invoice id={invoice} onClose={() => setInvoice(null)} />}
    </>
  );
}
