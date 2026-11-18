import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { invoiceTotals } from "./invoiceTotals.js";

const amount = (value) =>
  "INR " +
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
// Built-in PDF fonts use INR rather than an unsupported rupee glyph.
export function buildInvoicePdf(invoice, settings, duplicate = false) {
  const thermal = settings.paper === "80mm";
  const margin = thermal ? 4 : 14;
  function render(height) {
    const pdf = new jsPDF({
      unit: "mm",
      format: thermal ? [80, height] : "a4",
      orientation: "portrait",
      compress: true,
    });
    pdf.setProperties({
      title: invoice.number,
      subject: "Retail shop demo invoice",
      author: settings.shop_name || "Thread & Ledger",
    });
    const width = pdf.internal.pageSize.getWidth();
    let y = margin;
    const text = (value, size = 9, bold = false, gap = 2) => {
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(size);
      const lines = pdf.splitTextToSize(
        String(value || ""),
        width - margin * 2,
      );
      const needed = lines.length * size * 0.4 + gap;
      if (y + needed > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        y = margin;
      }
      y += size * 0.35;
      pdf.text(lines, margin, y);
      y += lines.length * size * 0.4 + gap;
    };
    text(settings.shop_name || "Thread & Ledger", thermal ? 14 : 20, true);
    text(settings.address, thermal ? 8 : 9);
    text(settings.mobile, 8);
    text("DEMO - NOT A TAX INVOICE", 9, true);
    text(
      `${invoice.kind === "sale" ? "Retail sales invoice" : "Stock purchase"}: ${invoice.number}`,
      10,
      true,
    );
    text(
      `${new Date(invoice.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })} | ${invoice.status.toUpperCase()}${duplicate ? " | DUPLICATE COPY" : ""}`,
      8,
    );
    text(
      `${invoice.kind === "sale" ? "Customer" : "Supplier"}: ${invoice.party || "Walk-in customer"}`,
      9,
    );
    if (invoice.staff) text("Billed by: " + invoice.staff, 8);
    if (invoice.reference) text("Reference: " + invoice.reference, 8);
    if (settings.gstin) text("Demo GSTIN: " + settings.gstin, 8);
    autoTable(pdf, {
      startY: y,
      margin: { left: margin, right: margin, top: margin, bottom: margin },
      head: [
        thermal
          ? ["Item / Qty / Unit price", "Total (INR)"]
          : [
              "Product / code",
              "HSN",
              "Qty",
              "Unit price",
              "Discount",
              "Demo GST",
              "Total",
            ],
      ],
      body: invoice.items.map((i) =>
        thermal
          ? [
              `${i.product_name}\n${i.product_code}\n${i.quantity} pc x ${amount(i.price)}\nDiscount ${amount(i.discount)} | GST ${i.gst_rate}%: ${amount(i.tax)}${i.returned ? `\nReturned: ${i.returned} pc` : ""}`,
              amount(i.total),
            ]
          : [
              `${i.product_name}\n${i.product_code}${i.returned ? `\nReturned: ${i.returned} pc` : ""}`,
              i.hsn || "-",
              `${i.quantity} pc`,
              amount(i.price),
              amount(i.discount),
              `${i.gst_rate}%\n${amount(i.tax)}`,
              amount(i.total),
            ],
      ),
      styles: {
        font: "helvetica",
        fontSize: thermal ? 7 : 8,
        cellPadding: thermal ? 1.5 : 2.3,
        overflow: "linebreak",
        textColor: [38, 61, 55],
      },
      headStyles: { fillColor: [33, 78, 65], textColor: 255 },
      columnStyles: thermal
        ? { 0: { cellWidth: 45 }, 1: { halign: "right" } }
        : {
            0: { cellWidth: 49 },
            1: { cellWidth: 14 },
            2: { cellWidth: 12 },
            6: { halign: "right" },
          },
      rowPageBreak: "avoid",
      showHead: "everyPage",
      theme: "grid",
    });
    y = pdf.lastAutoTable.finalY + 5;
    const { paid, returned, due } = invoiceTotals(invoice);
    const half = Math.round(Number(invoice.tax) * 50) / 100;
    const summary = [
      ["Taxable amount", invoice.subtotal],
      ...(invoice.tax_mode === "inter"
        ? [["Demo IGST", invoice.tax]]
        : [
            ["Demo CGST", half],
            ["Demo SGST", Number(invoice.tax) - half],
          ]),
      ["Total", invoice.total],
      ["Returns", returned],
      ["Net payments", paid],
      ["Balance due", due],
    ];
    autoTable(pdf, {
      startY: y,
      margin: {
        left: thermal ? margin : width - 86,
        right: margin,
        top: margin,
        bottom: margin,
      },
      body: summary.map(([label, value]) => [label, amount(value)]),
      theme: "plain",
      styles: { fontSize: thermal ? 8 : 10, cellPadding: 1.5 },
      columnStyles: { 1: { halign: "right" } },
      rowPageBreak: "avoid",
      didParseCell(data) {
        if (data.row.raw[0] === "Total") {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [237, 243, 233];
        }
      },
    });
    y = pdf.lastAutoTable.finalY + 5;
    const paymentMethods = [
      ...new Set(invoice.payments.map((p) => p.method)),
    ].join(", ");
    if (paymentMethods) text("Payment records: " + paymentMethods, 8);
    text(settings.footer || "Thank you for shopping with us.", 8);
    text("Client demo only. No actual payment processing.", 7);
    const end = y + margin;
    if (!thermal) {
      for (let page = 1; page <= pdf.getNumberOfPages(); page++) {
        pdf.setPage(page);
        pdf.setFontSize(8);
        pdf.setTextColor(120);
        pdf.text(
          `${invoice.number} | Page ${page} of ${pdf.getNumberOfPages()}`,
          margin,
          289,
        );
      }
    }
    return { pdf, end };
  }
  if (!thermal) return render().pdf;
  const draft = render(2000);
  return render(Math.min(2000, Math.max(100, Math.ceil(draft.end + 4)))).pdf;
}

export function downloadInvoice(invoice, settings, duplicate) {
  buildInvoicePdf(invoice, settings, duplicate).save(
    `${invoice.number.replace(/[^a-zA-Z0-9_-]/g, "-")}${duplicate ? "-duplicate" : ""}.pdf`,
  );
}
