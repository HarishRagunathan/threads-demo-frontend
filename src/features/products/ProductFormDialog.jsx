import { Modal } from "../../components/ui/Modal.jsx";
import { api } from "../../lib/api.js";
import { Button } from "../../components/ui/Button.jsx";
import { generateBarcodeValue } from "../barcodes/barcodeUtils.js";
import { Field } from "../../components/ui/Field.jsx";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import React from "react";

export function ProductFormDialog({
  edit,
  setEdit,
  setBusy,
  load,
  notify,
  setFormError,
  fields,
  categories,
  brands,
  formError,
  busy,
}) {
  return (
    <Modal
      title={edit.id ? "Edit product" : "Add a new product"}
      onClose={() => setEdit(null)}
      wide
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await api("/products" + (edit.id ? "/" + edit.id : ""), {
              method: edit.id ? "PUT" : "POST",
              body: edit,
            });
            setEdit(null);
            load();
            notify("Product saved");
          } catch (e) {
            setFormError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {!edit.id && (
          <div className="info-note">
            A unique barcode is generated for this retail product. You can keep
            it or enter a manufacturer’s barcode.{" "}
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setEdit({ ...edit, barcode: generateBarcodeValue() })
              }
            >
              Generate another barcode
            </Button>
          </div>
        )}
        <div className="form-grid">
          {fields
            .filter(([key]) => !edit.id || key !== "opening_stock")
            .map(([key, label, type]) => (
              <Field
                key={key}
                label={label}
                type={["category", "brand"].includes(type) ? undefined : type}
                options={
                  ["category", "brand"].includes(type)
                    ? [
                        { value: "", label: "Select…" },
                        ...(type === "category"
                          ? categories.data || []
                          : brands.data || []
                        ).map((r) => ({ value: r.id, label: r.name })),
                      ]
                    : undefined
                }
                value={edit[key] ?? ""}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    [key]: ["category_id", "brand_id"].includes(key)
                      ? e.target.value
                        ? Number(e.target.value)
                        : null
                      : e.target.value,
                  })
                }
                required={["name", "purchase_price", "selling_price"].includes(
                  key,
                )}
                min={type === "number" ? 0 : undefined}
                step={type === "number" ? "0.01" : undefined}
              />
            ))}
          <label className="check-field">
            <input
              type="checkbox"
              checked={edit.active}
              onChange={(e) => setEdit({ ...edit, active: e.target.checked })}
            />{" "}
            Product is active
          </label>
        </div>
        <ErrorBox error={formError} />
        <div className="modal-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setEdit(null)}
          >
            Cancel
          </Button>
          <Button disabled={busy}>Save product</Button>
        </div>
      </form>
    </Modal>
  );
}
