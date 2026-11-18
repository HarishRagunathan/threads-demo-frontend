import React, { useEffect, useRef, useState } from "react";
import { Barcode } from "lucide-react";
import { findScannedProduct } from "../../barcodes/barcodeUtils.js";

// Keyboard-wedge scanners either finish with Enter/Tab or stop transmitting.
// Both paths consume the buffer once, without involving catalogue search.
export function BarcodeBillingInput({
  products,
  loading,
  inputRef,
  onProduct,
  onError,
}) {
  const [value, setValue] = useState("");
  const buffer = useRef(""),
    timer = useRef(null),
    callbacks = useRef({ products, onProduct, onError });
  callbacks.current = { products, onProduct, onError };
  const consume = () => {
    clearTimeout(timer.current);
    const code = buffer.current.trim();
    buffer.current = "";
    setValue("");
    if (!code) return;
    const product = findScannedProduct(callbacks.current.products, code);
    if (product) callbacks.current.onProduct(product);
    else
      callbacks.current.onError(
        `Barcode or product code "${code}" not found. No item was added.`,
      );
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading, inputRef]);
  return (
    <div className="billing-scanner">
      <label htmlFor="billing-scanner">Scan to add directly to bill</label>
      <div className="search">
        <Barcode size={21} />
        <input
          id="billing-scanner"
          ref={inputRef}
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
          placeholder="Scan barcode / product code"
          value={value}
          onChange={(e) => {
            buffer.current = e.target.value;
            setValue(e.target.value);
            clearTimeout(timer.current);
            timer.current = setTimeout(consume, 180);
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" ||
              (e.key === "Tab" && buffer.current.trim())
            ) {
              e.preventDefault();
              consume();
            }
          }}
        />
      </div>
      <small>
        Scan → added to bill · Scan again → quantity +1 · No search or button
        needed
      </small>
    </div>
  );
}
