export function generateBarcodeValue() {
  // Stable once saved. Unique database constraint also protects imported codes.
  return (
    "TL" +
    Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) =>
      b.toString(16).padStart(2, "0"),
    )
      .join("")
      .toUpperCase()
  );
}

export function findScannedProduct(products, scanned) {
  const value = String(scanned).trim();
  if (!value) return null;
  return (
    products.find(
      (p) =>
        p.active &&
        (p.barcode === value || p.code.toLowerCase() === value.toLowerCase()),
    ) || null
  );
}

export function downloadBarcodeSvg(svg, code) {
  const cloned = svg.cloneNode(true);
  cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const blob = new Blob([new XMLSerializer().serializeToString(cloned)], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = `barcode-${code.replace(/[^a-zA-Z0-9_-]/g, "-")}.svg`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
