import { useApp } from "../../context/AppContext.jsx";
import { useData } from "../../hooks/useData.js";
import React, { useState } from "react";
import { PageTitle } from "../../components/ui/PageTitle.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Download, Plus, Search } from "lucide-react";
import { exportExcel } from "../../lib/export.js";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { Loading } from "../../components/ui/Loading.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { docColumns } from "../../components/documents/documentColumns.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { POS } from "../pos/POSPage.jsx";
import { Invoice } from "../invoices/InvoiceDialog.jsx";

export function Documents({ kind }) {
  const { notify } = useApp(),
    { data, loading, error, load } = useData("/documents?kind=" + kind);
  const [search, setSearch] = useState(""),
    [day, setDay] = useState(""),
    [create, setCreate] = useState(false),
    [invoice, setInvoice] = useState(null);
  const rows = (data || []).filter(
    (r) =>
      (r.number + " " + r.party + " " + r.reference)
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!day ||
        new Date(r.created_at).toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        }) === day),
  );
  return (
    <>
      <PageTitle
        title={
          kind === "sale"
            ? "Every sale, accounted for."
            : "Purchases & receiving."
        }
        description={
          kind === "sale"
            ? "Your invoices, payments, and customer history."
            : "Bring new stock into your shop with confidence."
        }
      >
        <Button
          variant="secondary"
          icon={Download}
          onClick={() => exportExcel(rows, kind + "s")}
        >
          Export
        </Button>
        <Button icon={Plus} onClick={() => setCreate(true)}>
          New {kind}
        </Button>
      </PageTitle>
      <ErrorBox error={error} />
      <section className="panel">
        <div className="toolbar">
          <div className="search">
            <Search size={17} />
            <input
              placeholder="Search invoice or name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <input
            aria-label="Invoice date"
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </div>
        {loading ? (
          <Loading />
        ) : (
          <Table
            rows={rows}
            columns={docColumns}
            onRow={(r) => setInvoice(r.id)}
          />
        )}
      </section>
      {create && (
        <Modal title={"New " + kind} wide onClose={() => setCreate(false)}>
          <POS
            kind={kind}
            embedded
            onComplete={(id) => {
              setCreate(false);
              setInvoice(id);
              load();
            }}
          />
        </Modal>
      )}
      {invoice && (
        <Invoice
          id={invoice}
          onClose={() => {
            setInvoice(null);
            load();
          }}
        />
      )}
    </>
  );
}
