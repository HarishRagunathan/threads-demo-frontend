import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";

export function buildBarcodePdf(product, shopName, copies = 1) {
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const encoded = {};
  JsBarcode(encoded, product.barcode, {
    format: "CODE128",
    displayValue: false,
  });
  const bits = encoded.encodings.map((e) => e.data).join("");
  const count = Math.max(1, Math.min(100, Math.floor(copies)));
  for (let i = 0; i < count; i++) {
    const index = i % 21;
    if (i && index === 0) pdf.addPage();
    const x = 10 + (index % 3) * 64,
      y = 10 + Math.floor(index / 3) * 39;
    pdf.setDrawColor(210);
    pdf.rect(x, y, 62, 37);
    pdf.setTextColor(0);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(
      pdf.splitTextToSize(shopName || "Retail shop", 56).slice(0, 1),
      x + 31,
      y + 4,
      { align: "center" },
    );
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text(pdf.splitTextToSize(product.name, 56).slice(0, 2), x + 31, y + 8, {
      align: "center",
    });
    // Vector bars preserve sharp edges; 4 mm quiet zones on each side.
    const barWidth = 54 / bits.length;
    pdf.setFillColor(0);
    for (let bit = 0; bit < bits.length; bit++)
      if (bits[bit] === "1")
        pdf.rect(x + 4 + bit * barWidth, y + 13, barWidth, 12, "F");
    pdf.setFontSize(7);
    pdf.text(product.barcode, x + 31, y + 29, { align: "center" });
    pdf.text(
      `${product.code} | INR ${Number(product.selling_price).toFixed(2)} / piece`,
      x + 31,
      y + 34,
      { align: "center" },
    );
  }
  return pdf;
}
export function downloadBarcodePdf(product, shopName, copies) {
  buildBarcodePdf(product, shopName, copies).save(
    `labels-${product.code.replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`,
  );
}
