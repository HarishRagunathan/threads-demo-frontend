import { test, expect } from '@playwright/test';

const user = { id: 1, name: 'Demo Administrator', role: 'admin', permissions: {} };

test('a rejected dashboard session returns to login and allows signing in again', async ({ page }) => {
  let signedIn = true;
  let rejectDashboard = true;
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    let status = 200;
    let body = {};
    if (path === '/api/auth/login') {
      signedIn = true;
      rejectDashboard = false;
      body = user;
    } else if (path === '/api/auth/me') {
      status = signedIn ? 200 : 401;
      body = signedIn ? user : { error: 'Please sign in' };
    } else if (path === '/api/dashboard') {
      if (rejectDashboard) {
        signedIn = false;
        status = 401;
        body = { error: 'Please sign in' };
      } else {
        body = { summary: {}, chart: [], recent: [], low: [] };
      }
    }
    await route.fulfill({ status, json: body });
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome to your shop.' })).toBeVisible();
  await expect(page.getByText('Your session has ended. Please sign in again.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A fresh view of your shop.' })).toHaveCount(0);
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Open workspace' }).click();
  await expect(page.getByRole('heading', { name: 'A fresh view of your shop.' })).toBeVisible();
});

test('login does not open the workspace when its session cookie is missing', async ({ page }) => {
  await page.route('**/api/**', route => {
    const login = new URL(route.request().url()).pathname === '/api/auth/login';
    return route.fulfill({ status: login ? 200 : 401, json: login ? user : { error: 'Please sign in' } });
  });
  await page.goto('/');
  await page.getByLabel('Password', { exact: true }).fill('test-password');
  await page.getByRole('button', { name: 'Open workspace' }).click();
  await expect(page.getByText('Please sign in', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Welcome to your shop.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A fresh view of your shop.' })).toHaveCount(0);
});

