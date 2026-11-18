import { useData } from "../../hooks/useData.js";
import React, { useState } from "react";
import { Modal } from "../../components/ui/Modal.jsx";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { fmt } from "../../lib/format.js";
import { Loading } from "../../components/ui/Loading.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { docColumns } from "../../components/documents/documentColumns.jsx";
import { Invoice } from "../invoices/InvoiceDialog.jsx";

export function PartyHistory({ party, kind, onClose }) {
  const { data, loading, error } = useData("/documents?kind=" + kind);
  const rows = (data || []).filter(
    (d) =>
      Number(d[kind === "sale" ? "customer_id" : "supplier_id"]) === party.id,
  );
  const [invoice, setInvoice] = useState(null);
  return (
    <Modal title={party.name + " · Transaction history"} onClose={onClose} wide>
      <ErrorBox error={error} />
      <div className="info-note">
        Outstanding balance:{" "}
        <strong>
          {fmt(
            rows
              .filter((r) => r.status === "completed")
              .reduce(
                (s, r) =>
                  s +
                  Number(r.total) -
                  Number(r.returned_amount) -
                  Number(r.paid),
                0,
              ),
          )}
        </strong>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <Table
          rows={rows}
          columns={docColumns}
          onRow={(r) => setInvoice(r.id)}
        />
      )}{" "}
      {invoice && <Invoice id={invoice} onClose={() => setInvoice(null)} />}
    </Modal>
  );
}
