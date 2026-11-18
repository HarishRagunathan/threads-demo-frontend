import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config({ path: new URL("../../backend/.env", import.meta.url) });
test("administrator can navigate the connected demo and build a bill", async ({
  page,
}) => {
  const errors = [];
  page.on("requestfailed", (request) =>
    console.log("Request failed:", request.url(), request.failure()?.errorText),
  );
  page.on("console", (message) => {
    if (message.type() === "error")
      console.log("Browser error:", message.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
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
  await expect(
    page.getByRole("heading", { name: "Sales performance" }),
  ).toBeVisible();
  await expect(page.locator('[role="alert"]')).toHaveCount(0);
  await page.screenshot({ path: "artifacts/dashboard.png", fullPage: true });
  for (const [navigation, title] of [
    ["Products", "Your collection."],
    ["Inventory", "Inventory, in balance."],
    ["Customers", "Customers"],
    ["Suppliers", "Suppliers"],
    ["Sales & invoices", "Every sale, accounted for."],
    ["Purchases", "Purchases & receiving."],
    ["Returns & refunds", "Returns & refunds"],
    ["Payments", "Payment ledger"],
    ["Expenses", "Expenses"],
    ["Reports", "The bigger picture."],
    ["Categories", "Categories"],
    ["Brands", "Brands"],
    ["Staff & access", "A team you can count on."],
    ["My shifts", "Your working day."],
    ["Activity log", "Activity log"],
    ["Settings", "Make it your shop."],
  ]) {
    await page
      .locator("nav")
      .getByRole("button", { name: navigation, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page.locator('[role="alert"]')).toHaveCount(0);
  }
  await page
    .locator("nav")
    .getByRole("button", { name: "Point of sale" })
    .click();
  await page.getByPlaceholder("Scan barcode / product code").fill("PRD-0001");
  await page.getByPlaceholder("Scan barcode / product code").press("Enter");
  await expect(page.getByText("1 items in your basket")).toBeVisible();
  await expect(page.locator(".catalog-card")).toHaveCount(0);
  await expect(
    page.getByLabel("Customer (optional for full payment)"),
  ).toHaveValue("");
  await expect(page.getByLabel("Payment amount")).not.toHaveValue("");
  await page.getByRole("button", { name: "Review sale" }).click();
  await expect(
    page.getByRole("heading", { name: "Confirm sale" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "artifacts/pos.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("heading", { name: "Let’s make a sale." }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".sidebar")
        .evaluate((el) => Math.round(el.getBoundingClientRect().right)),
    )
    .toBeLessThanOrEqual(0);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 2,
  );
  expect(overflow).toBe(false);
  await page.screenshot({
    path: "artifacts/mobile-pos.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.getByRole("button", { name: "Review sale" }).click();
  await page.getByRole("button", { name: "Confirm & complete" }).click();
  await expect(
    page.getByText("DEMO · NOT A TAX INVOICE", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cancel invoice", exact: true })
    .click();
  await page
    .getByLabel("Reason", { exact: true })
    .fill("Browser demo validation completed");
  await page.getByRole("button", { name: "Confirm cancellation" }).click();
  await expect(page.locator(".invoice-header")).toContainText("CANCELLED");
  expect(errors).toEqual([]);
});
