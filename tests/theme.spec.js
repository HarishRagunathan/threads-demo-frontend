import { test, expect } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config({ path: new URL("../../backend/.env", import.meta.url) });

test("topbar appearance changes palette, persists preferences, follows system and fits mobile", async ({
  page,
}) => {
  const errors = [];
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
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.screenshot({ path: "artifacts/theme-light.png", fullPage: true });
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Appearance and primary color" })
    .click();
  const panel = page.getByRole("dialog", { name: "Appearance settings" });
  await panel.getByRole("button", { name: "Teal primary color" }).click();
  await expect(
    panel.getByRole("button", { name: "Teal primary color" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((el) => el.style.getPropertyValue("--primary")),
    )
    .toBe("#0d9488");
  await page.getByRole("button", { name: "Close appearance settings" }).click();
  await page.screenshot({ path: "artifacts/theme-dark.png", fullPage: true });
  await page.locator('nav').getByRole('button',{name:'Point of sale'}).click();
  await page.getByPlaceholder('Scan barcode / product code').fill('PRD-0001');
  await expect(page.locator('.cart-item')).toHaveCount(1);
  await page.screenshot({path:'artifacts/theme-dark-billing.png',fullPage:true,animations:'disabled'});
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "A fresh view of your shop." }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((el) => el.style.getPropertyValue("--primary")),
    )
    .toBe("#0d9488");
  await page
    .getByRole("button", { name: "Appearance and primary color" })
    .click();
  await panel.getByLabel("Custom primary color").fill("#f4c542");
  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((el) => el.style.getPropertyValue("--primary")),
    )
    .toBe("#f4c542");
  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((el) => el.style.getPropertyValue("--primary-ink")),
    )
    .toBe("#101828");
  await panel.getByRole("button", { name: "System", exact: true }).click();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(()=>page.locator('.sidebar').evaluate(el=>Math.round(el.getBoundingClientRect().right))).toBeLessThanOrEqual(0);
  await page.evaluate(()=>window.scrollTo(0,0));
  const bounds = await panel.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "artifacts/theme-mobile.png", fullPage: true, animations:'disabled' });
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await page
    .getByRole("button", { name: "Appearance and primary color" })
    .click();
  await panel.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((el) => el.style.getPropertyValue("--primary")),
    )
    .toBe("#6d5ef4");
  expect(errors).toEqual([]);
});
