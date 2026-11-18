import React, { useState } from "react";
import { Shirt } from "lucide-react";

export function BillingProductImage({ product }) {
  const [failedSource, setFailedSource] = useState(null);
  const source = product?.image?.trim();
  const name = product?.name || "Product";

  return (
    <div className="billing-product-image">
      {source && failedSource !== source ? (
        <img
          src={source}
          alt={name}
          loading="lazy"
          onError={() => setFailedSource(source)}
        />
      ) : (
        <span
          className="billing-image-placeholder"
          role="img"
          aria-label={`No image available for ${name}`}
        >
          <Shirt size={27} strokeWidth={1.4} aria-hidden="true" />
          <small>No image</small>
        </span>
      )}
    </div>
  );
}
