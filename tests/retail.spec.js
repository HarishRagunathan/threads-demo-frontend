import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import dotenv from "dotenv";
dotenv.config({ path: new URL("../../backend/.env", import.meta.url) });
const api = "http://127.0.0.1:4000/api";
async function login(page) {
  await page.goto("/");
  await page
    .getByLabel("Username", { exact: true })
    .fill(process.env.DEMO_ADMIN_USERNAME);
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.DEMO_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Open workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "A fresh view of your shop." }),
  ).toBeVisible();
}
async function pdfInfo(bytes) {
  const task = getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: true,
  });
  const doc = await task.promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const p = await doc.getPage(i);
    text += (await p.getTextContent()).items.map((i) => i.str).join(" ");
  }
  const result = {
    pages: doc.numPages,
    text,
    width: (await doc.getPage(1)).view[2],
  };
  await task.destroy();
  return result;
}

test("each product has downloadable barcode labels and exact repeated retail scanning", async ({
  page,
}) => {
  await login(page);
  const products = await (await page.request.get(api + "/products")).json();
  const product = products.find((p) => p.code === "PRD-0002");
  await page
    .locator("nav")
    .getByRole("button", { name: "Products", exact: true })
    .click();
  await page
    .getByPlaceholder("Search product, code or scan barcode…")
    .fill(product.barcode);
  await page.getByRole("button", { name: "Barcode", exact: true }).click();
  const label = page.getByRole("dialog", { name: "Barcode · " + product.name });
  await expect(label.locator(".barcode-preview svg")).toHaveCount(1);
  let downloadPromise = page.waitForEvent("download");
  await label.getByRole("button", { name: "Download SVG" }).click();
  let download = await downloadPromise;
  const svg = await fs.readFile(await download.path(), "utf8");
  expect(svg).toContain(product.barcode);
  await label.getByLabel("Number of labels").fill("3");
  downloadPromise = page.waitForEvent("download");
  await label.getByRole("button", { name: "Download labels PDF" }).click();
  download = await downloadPromise;
  const pdf = await pdfInfo(await fs.readFile(await download.path()));
  expect(pdf.pages).toBe(1);
  expect(pdf.text.match(new RegExp(product.barcode, "g"))).toHaveLength(3);
  await label.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .locator("nav")
    .getByRole("button", { name: "Point of sale" })
    .click();
  const scanner = page.getByPlaceholder("Scan barcode / product code");
  await expect(scanner).toBeEnabled();
  await scanner.fill(product.barcode);
  await expect(page.getByText("1 items in your basket")).toBeVisible();
  const quantity = page
    .locator(".cart-items")
    .getByLabel("Qty", { exact: true });
  await quantity.fill("2");
  await scanner.fill(product.barcode);
  await scanner.press("Enter");
  await expect(quantity).toHaveValue("3");
  await scanner.fill("UNKNOWN-BARCODE");
  await scanner.press("Enter");
  await expect(page.getByRole("alert")).toContainText("not found");
  await expect(quantity).toHaveValue("3");
  await scanner.fill("Linen");
  await scanner.press("Enter");
  await expect(quantity).toHaveValue("3");
  await scanner.fill(product.code);
  await expect(quantity).toHaveValue("4");
  await expect(scanner).toHaveValue("");
  await expect(page.getByPlaceholder("Search products by name…")).toHaveCount(
    0,
  );
  await expect(page.locator(".catalog-card")).toHaveCount(0);
  await expect(page.locator(".cart-item")).toHaveCount(1);
  await page.screenshot({
    path: "artifacts/retail-scanning.png",
    fullPage: true,
  });
});

test("invoice direct downloads and browser printing contain one receipt without blank app pages", async ({
  page,
}) => {
  await login(page);
  await page
    .locator("nav")
    .getByRole("button", { name: "Sales & invoices", exact: true })
    .click();
  await page.locator("tbody tr").first().click();
  await expect(
    page.getByRole("button", { name: "Download PDF" }),
  ).toBeVisible();
  const invoice = page.locator(".invoice");
  const number = await invoice.locator("h3").first().innerText();
  await page.getByLabel("Receipt paper").selectOption("A4");
  let downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF", exact: true }).click();
  let download = await downloadPromise;
  const a4 = await pdfInfo(await fs.readFile(await download.path()));
  expect(a4.pages).toBe(1);
  expect(a4.text).toContain(number);
  expect(a4.text).toContain("Retail sales invoice");
  expect(a4.text).not.toContain("Workspace");
  await download.saveAs("artifacts/retail-invoice-a4.pdf");
  await page.evaluate(() => {
    window.print = () => {
      window.__printRequested = true;
    };
  });
  await page.getByRole("button", { name: "Print receipt" }).click();
  await expect
    .poll(() => page.evaluate(() => window.__printRequested))
    .toBe(true);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("#root")).toBeHidden();
  await expect(page.locator("#print-root .invoice")).toBeVisible();
  const printed = await page.pdf({
    preferCSSPageSize: true,
    printBackground: true,
    path: "artifacts/retail-browser-print.pdf",
  });
  const printInfo = await pdfInfo(printed);
  expect(printInfo.pages).toBe(1);
  expect(printInfo.text).toContain(number);
  expect(printInfo.text).not.toContain("Workspace");
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  await expect(page.locator("#root")).toBeVisible();
  await page.getByLabel("Receipt paper").selectOption("80mm");
  downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF", exact: true }).click();
  download = await downloadPromise;
  const thermal = await pdfInfo(await fs.readFile(await download.path()));
  expect(thermal.pages).toBe(1);
  expect(thermal.width).toBeCloseTo((80 * 72) / 25.4, 0);
  expect(thermal.text).toContain(number);
  await download.saveAs("artifacts/retail-invoice-80mm.pdf");
  await page.screenshot({
    path: "artifacts/retail-invoice-dialog.png",
    fullPage: true,
  });
});
