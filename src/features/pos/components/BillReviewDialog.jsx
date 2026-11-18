import { Modal } from "../../../components/ui/Modal.jsx";
import { Table } from "../../../components/ui/Table.jsx";
import { fmt } from "../../../lib/format.js";
import { Button } from "../../../components/ui/Button.jsx";
import React from "react";

export function BillReviewDialog({
  kind,
  busy,
  setPreview,
  lines,
  total,
  paid,
  complete,
}) {
  return (
    <Modal title={"Confirm " + kind} onClose={() => !busy && setPreview(false)}>
      <div className="info-note">
        {kind === "sale"
          ? "Completing this bill reduces stock and records the selected demo payments."
          : "Receiving this purchase increases stock and records supplier payments."}
      </div>
      <Table
        rows={lines}
        columns={[
          { key: "name", label: "Product", render: (i) => i.p?.name },
          { key: "quantity", label: "Qty" },
          { key: "total", label: "Total", render: (i) => fmt(i.total) },
        ]}
      />
      <div className="confirmation-total">
        <span>Grand total</span>
        <strong>{fmt(total)}</strong>
      </div>
      <p className="muted">
        Payment recorded: {fmt(paid)} · Balance: {fmt(total - paid)}
      </p>
      <div className="modal-actions">
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => setPreview(false)}
        >
          Back
        </Button>
        <Button disabled={busy} onClick={complete}>
          {busy ? "Saving…" : "Confirm & complete"}
        </Button>
      </div>
    </Modal>
  );
}
