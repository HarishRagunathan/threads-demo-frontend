import { Empty } from "../../../components/ui/Empty.jsx";
import { Trash2 } from "lucide-react";
import { Field } from "../../../components/ui/Field.jsx";
import { can } from "../../../lib/permissions.js";
import { fmt } from "../../../lib/format.js";
import React from "react";
import { BillingProductImage } from "./BillingProductImage.jsx";

export function CartItems({ cart, lines, setCart, update, kind, user }) {
  return (
    <div className="cart-items">
      {!cart.length ? (
        <Empty
          text="Your basket is ready"
          detail={
            kind === "sale"
              ? "Scan a barcode or product code to add the first item."
              : "Scan a barcode or select a product to get started."
          }
        />
      ) : (
        lines.map((i) => (
          <div className="cart-item" key={i.product_id}>
            <div className="cart-item-title">
              <BillingProductImage product={i.p} />
              <div className="billing-product-details">
                <strong>{i.p?.name || "Product"}</strong>
                <small>
                  {i.p?.code} · {i.p?.barcode}
                </small>
              </div>
              <button
                className="icon-button"
                title="Remove product"
                onClick={() =>
                  setCart(cart.filter((c) => c.product_id !== i.product_id))
                }
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="cart-controls">
              <Field
                label="Qty"
                type="number"
                min="1"
                step="1"
                value={i.quantity}
                onChange={(e) =>
                  update(i.product_id, "quantity", e.target.value)
                }
              />
              <Field
                label="Price"
                type="number"
                min="0"
                step="0.01"
                disabled={kind === "sale" && !can(user, "price_editing")}
                value={i.price}
                onChange={(e) => update(i.product_id, "price", e.target.value)}
              />
              <Field
                label="Discount ₹"
                type="number"
                min="0"
                step="0.01"
                disabled={!can(user, "discounts")}
                value={i.discount}
                onChange={(e) =>
                  update(i.product_id, "discount", e.target.value)
                }
              />
              <strong>{fmt(i.total)}</strong>
            </div>
            <small>Demo GST: {fmt(i.tax)}</small>
          </div>
        ))
      )}
    </div>
  );
}
