import React from "react";
import { BarcodeSvg } from "./BarcodeSvg.jsx";
import { fmt } from "../../lib/format.js";

export function BarcodeLabel({ product, shopName }) {
  return (
    <div className="barcode-sticker">
      <h3>{shopName}</h3>
      <h3>{product.name}</h3>
      <BarcodeSvg value={product.barcode} />
      <p>
        {product.code} · {fmt(product.selling_price)} / piece
      </p>
    </div>
  );
}
