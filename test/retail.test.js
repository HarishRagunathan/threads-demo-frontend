import { test } from "node:test";
import assert from "node:assert/strict";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import JsBarcode from "jsbarcode";
import { Code128Reader, BitArray } from "@zxing/library";
import { buildInvoicePdf } from "../src/features/invoices/invoicePdf.js";
import { buildBarcodePdf } from "../src/features/barcodes/barcodePdf.js";
import {
  generateBarcodeValue,
  findScannedProduct,
} from "../src/features/barcodes/barcodeUtils.js";

const settings = {
  shop_name: "Thread & Ledger",
  address: "24 Cotton Street, Chennai",
  mobile: "9000000001",
  gstin: "DEMO",
  footer: "Thank you for shopping with us.",
  paper: "A4",
};
const item = {
  id: 1,
  product_name: "Oxford Cotton Shirt",
  product_code: "PRD-0001",
  quantity: 1,
  price: 999,
  discount: 0,
  gst_rate: 5,
  tax: 49.95,
  total: 1048.95,
  hsn: "DEMO",
  returned: 0,
};
const invoice = {
  number: "QA-S-00001",
  kind: "sale",
  created_at: "2026-11-17T08:00:00Z",
  status: "completed",
  party: "Walk-in customer",
  staff: "Demo administrator",
  items: [item],
  subtotal: 999,
  tax: 49.95,
  total: 1048.95,
  tax_mode: "intra",
  payments: [{ amount: 1048.95, method: "Cash", is_refund: false }],
  returns: [],
};
async function readPdf(pdf) {
  const task = getDocument({
    data: new Uint8Array(pdf.output("arraybuffer")),
    useSystemFonts: true,
  });
  const doc = await task.promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    pages.push({
      text: (await page.getTextContent()).items.map((i) => i.str).join(" "),
      width: page.view[2],
      height: page.view[3],
    });
  }
  await task.destroy();
  return pages;
}

test("short A4 retail invoice downloads as one page with correct totals and customer", async () => {
  const pages = await readPdf(buildInvoicePdf(invoice, settings));
  assert.equal(pages.length, 1);
  assert.match(pages[0].text, /QA-S-00001/);
  assert.match(pages[0].text, /Walk-in customer/);
  assert.match(pages[0].text, /1,048.95/);
  assert.match(pages[0].text, /Oxford Cotton Shirt/);
  assert.ok(Math.abs(pages[0].width - 595.28) < 1);
});
test("80 mm PDF has correct width, readable retail items, and a compact single receipt", async () => {
  const pages = await readPdf(
    buildInvoicePdf(invoice, { ...settings, paper: "80mm" }, true),
  );
  assert.equal(pages.length, 1);
  assert.ok(Math.abs(pages[0].width - (80 * 72) / 25.4) < 1);
  assert.ok(pages[0].height < (297 * 72) / 25.4);
  assert.match(pages[0].text, /DUPLICATE COPY/);
  assert.match(pages[0].text, /1 pc/);
  assert.match(pages[0].text, /1,048.95/);
});
test("long invoice paginates without blank pages or losing the last item", async () => {
  const items = Array.from({ length: 75 }, (_, i) => ({
    ...item,
    product_name: `Retail product ${i + 1}`,
    product_code: `QA-${i + 1}`,
  }));
  const pages = await readPdf(
    buildInvoicePdf(
      { ...invoice, items, total: 78671.25, subtotal: 74925, tax: 3746.25 },
      settings,
    ),
  );
  assert.ok(pages.length > 1);
  assert.ok(pages.every((p) => p.text.length > 70));
  assert.match(pages.map((p) => p.text).join(" "), /Retail product 75/);
});
test("barcode label PDF repeats product identity and spills onto a second sheet after 21 labels", async () => {
  const pages = await readPdf(
    buildBarcodePdf(
      {
        name: "Oxford Cotton Shirt",
        code: "PRD-0001",
        barcode: "890100000001",
        selling_price: 999,
      },
      settings.shop_name,
      22,
    ),
  );
  assert.equal(pages.length, 2);
  assert.equal(
    pages
      .map((p) => p.text)
      .join(" ")
      .match(/890100000001/g).length,
    22,
  );
});
test("generated Code 128 data is readable by an independent decoder", () => {
  for (const value of [generateBarcodeValue(), "890100000001"]) {
    const encoded = {};
    JsBarcode(encoded, value, { format: "CODE128" });
    const data =
      "000000000000" +
      encoded.encodings.map((e) => e.data).join("") +
      "000000000000";
    const row = new BitArray(data.length);
    for (let i = 0; i < data.length; i++) if (data[i] === "1") row.set(i);
    assert.equal(new Code128Reader().decodeRow(0, row).getText(), value);
  }
});
test("scans match only exact active barcode or product code, never a partial name", () => {
  const products = [
    {
      id: 1,
      name: "Shirt",
      barcode: "890100000001",
      code: "PRD-0001",
      active: true,
    },
    { id: 2, barcode: "INACTIVE", code: "PRD-0002", active: false },
  ];
  assert.equal(findScannedProduct(products, " 890100000001\r\n").id, 1);
  assert.equal(findScannedProduct(products, "prd-0001").id, 1);
  assert.equal(findScannedProduct(products, "890100"), null);
  assert.equal(findScannedProduct(products, "Shirt"), null);
  assert.equal(findScannedProduct(products, "INACTIVE"), null);
  assert.equal(findScannedProduct(products, ""), null);
});
