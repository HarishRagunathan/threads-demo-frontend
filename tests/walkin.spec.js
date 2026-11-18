import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config({ path: new URL("../../backend/.env", import.meta.url) });
const api = "http://127.0.0.1:4000/api";

test("walk-in scan-only billing autofills payment, rejects intentional underpayment, and accepts split payment", async ({
  page,
}) => {
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
  await page
    .locator("nav")
    .getByRole("button", { name: "Point of sale" })
    .click();
  await expect(page.locator(".catalog-card")).toHaveCount(0);
  await expect(page.locator(".cart-item")).toHaveCount(0);
  await expect(
    page.getByText("Oxford Cotton Shirt", { exact: true }),
  ).toHaveCount(0);
  const scanner = page.getByPlaceholder("Scan barcode / product code");
  await scanner.fill("PRD-0001");
  await expect(page.locator(".cart-item")).toHaveCount(1);
  const payment = page.getByLabel("Payment amount", { exact: true });
  await expect(payment).not.toHaveValue("");
  const firstAmount = Number(await payment.inputValue());
  expect(firstAmount).toBeGreaterThan(0);
  await page.getByLabel("Payment method", { exact: true }).selectOption("Card");
  await scanner.fill("PRD-0001");
  await expect(
    page.locator(".cart-items").getByLabel("Qty", { exact: true }),
  ).toHaveValue("2");
  await expect(payment).toHaveValue(
    String(Math.round(firstAmount * 200) / 100),
  );
  await page
    .locator(".cart-items")
    .getByLabel("Discount ₹", { exact: true })
    .fill("10");
  await expect
    .poll(async () => Number(await payment.inputValue()))
    .toBeLessThan(firstAmount * 2);
  await payment.fill("100");
  await page.getByRole("button", { name: "Review sale", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Walk-in bills must be paid in full",
  );
  await expect(page.getByRole("heading", { name: "Confirm sale" })).toHaveCount(
    0,
  );
  await page
    .getByRole("button", { name: "Fill full amount", exact: true })
    .click();
  const total = Number(await payment.inputValue());
  await page
    .getByRole("button", { name: "+ Split payment", exact: true })
    .click();
  await page
    .getByLabel("Payment method", { exact: true })
    .nth(0)
    .selectOption("Cash");
  await page.getByLabel("Payment amount", { exact: true }).nth(0).fill("100");
  await page
    .getByLabel("Payment amount", { exact: true })
    .nth(1)
    .fill(String(Math.round((total - 100) * 100) / 100));
  await expect(
    page.getByLabel("Customer (optional for full payment)"),
  ).toHaveValue("");
  await page.getByRole("button", { name: "Review sale", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Confirm sale" }),
  ).toBeVisible();
  const responsePromise = page.waitForResponse(
    (r) => r.url() === api + "/documents" && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Confirm & complete" }).click();
  const response = await responsePromise;
  const document = await response.json();
  expect(response.status(), JSON.stringify(document)).toBe(200);
  try {
    expect(document.customer_id).toBeNull();
    const detail = await (
      await page.request.get(api + "/documents/" + document.id)
    ).json();
    expect(detail.payments).toHaveLength(2);
    expect(
      Math.round(
        detail.payments.reduce((sum, p) => sum + Number(p.amount), 0) * 100,
      ),
    ).toBe(Math.round(Number(detail.total) * 100));
    await expect(page.locator(".invoice-party")).toContainText(
      "Walk-in customer",
    );
  } finally {
    const cancelled = await page.request.post(
      api + "/documents/" + document.id + "/cancel",
      {
        data: { reason: "Walk-in billing regression complete", method: "Cash" },
      },
    );
    expect(cancelled.ok()).toBeTruthy();
  }
});
