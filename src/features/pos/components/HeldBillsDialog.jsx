import { Modal } from "../../../components/ui/Modal.jsx";
import { ErrorBox } from "../../../components/ui/ErrorBox.jsx";
import { date, uid } from "../../../lib/format.js";
import { Button } from "../../../components/ui/Button.jsx";
import { api } from "../../../lib/api.js";
import { Trash2 } from "lucide-react";
import { Empty } from "../../../components/ui/Empty.jsx";
import React from "react";

export function HeldBillsDialog({
  setShowHeld,
  held,
  cart,
  setCart,
  setParty,
  setHeldId,
  setPayments,
  submissionKey,
}) {
  return (
    <Modal title="Held bills" onClose={() => setShowHeld(false)}>
      <ErrorBox error={held.error} />
      {held.data?.length ? (
        held.data.map((h) => (
          <div className="held-row" key={h.id}>
            <div>
              <strong>{h.label}</strong>
              <small>
                {date(h.created_at)} · {h.data.items.length} lines
              </small>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                if (cart.length && !confirm("Replace the current basket?"))
                  return;
                setCart(h.data.items);
                setParty(h.data.customer_id || "");
                setHeldId(h.id);
                setPayments([{ method: "Cash", amount: "", reference: "" }]);
                submissionKey.current = uid();
                setShowHeld(false);
              }}
            >
              Resume
            </Button>
            <button
              className="icon-button"
              onClick={async () => {
                if (!confirm("Delete this held bill?")) return;
                await api("/held/" + h.id, { method: "DELETE" });
                held.load();
              }}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))
      ) : (
        <Empty text="No held bills" />
      )}
    </Modal>
  );
}
