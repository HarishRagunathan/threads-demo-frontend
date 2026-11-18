import React, { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";

export function BarcodeSvg({ value }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current)
      JsBarcode(ref.current, value, {
        format: "CODE128",
        height: 55,
        width: 1.5,
        margin: 12,
        fontSize: 14,
      });
  }, [value]);
  return <svg ref={ref} />;
}
