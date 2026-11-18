import React from "react";
import { BarcodeBillingInput } from "./BarcodeBillingInput.jsx";
import { CartItems } from "./CartItems.jsx";

export function ScannedItemsPanel({
  products,
  scanInput,
  add,
  setError,
  cart,
  lines,
  setCart,
  update,
  user,
}) {
  return (
    <section className="panel scanned-items-panel">
      <BarcodeBillingInput
        products={products.data || []}
        loading={products.loading}
        inputRef={scanInput}
        onProduct={add}
        onError={setError}
      />
      <div className="panel-heading">
        <div>
          <h2>Scanned products</h2>
          <p>Only items added to this bill appear here.</p>
        </div>
        <span className="badge">
          {cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}{" "}
          pieces
        </span>
      </div>
      <div className="scanned-items-body">
        <CartItems
          cart={cart}
          lines={lines}
          setCart={setCart}
          update={update}
          kind="sale"
          user={user}
        />
      </div>
    </section>
  );
}
