import { Modal } from "../../components/ui/Modal.jsx";
import { api } from "../../lib/api.js";
import { Field } from "../../components/ui/Field.jsx";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { Button } from "../../components/ui/Button.jsx";
import React from "react";

export function InvoiceActionDialog({
  action,
  busy,
  setAction,
  setBusy,
  id,
  form,
  actionKey,
  load,
  notify,
  setFormError,
  due,
  setForm,
  d,
  formError,
}) {
  return (
    <Modal
      title={
        action === "payments"
          ? "Record payment"
          : action === "returns"
            ? "Return against original invoice"
            : "Cancel invoice"
      }
      onClose={() => !busy && setAction(null)}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await api(`/documents/${id}/${action}`, {
              method: "POST",
              body: { ...form, idempotency_key: actionKey.current },
            });
            setAction(null);
            load();
            notify("Transaction updated");
          } catch (e) {
            setFormError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {action === "payments" ? (
          <Field
            label="Payment amount"
            type="number"
            min="0.01"
            max={due}
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        ) : action === "returns" ? (
          <>
            <Field
              label="Original invoice item"
              options={d.items
                .filter((i) => i.returned < i.quantity)
                .map((i) => ({
                  value: i.id,
                  label: `${i.product_name} · ${i.quantity - i.returned} available`,
                }))}
              value={form.item_id}
              onChange={(e) => setForm({ ...form, item_id: e.target.value })}
            />
            <Field
              label="Return quantity"
              type="number"
              min="1"
              step="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
            <Field
              label="Condition"
              options={["sellable", "damaged"]}
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
            />
          </>
        ) : (
          <div className="info-note">
            This reverses the original stock movement and records a demo refund
            of net payments. This cannot be undone.
          </div>
        )}
        {action !== "payments" && (
          <Field
            label="Reason"
            minLength={3}
            required
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
        )}
        <Field
          label={
            action === "payments" ? "Payment method" : "Demo refund method"
          }
          options={["Cash", "UPI", "Card", "Demo gateway"]}
          value={form.method}
          onChange={(e) => setForm({ ...form, method: e.target.value })}
        />
        {action === "payments" && (
          <Field
            label="Transaction reference"
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
          />
        )}
        <ErrorBox error={formError} />
        <div className="modal-actions">
          <Button disabled={busy}>
            {busy
              ? "Saving…"
              : "Confirm " +
                (action === "payments"
                  ? "payment"
                  : action === "returns"
                    ? "return"
                    : "cancellation")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
