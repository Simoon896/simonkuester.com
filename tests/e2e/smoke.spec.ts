import { test, expect } from '@playwright/test';

test('home loads with the right title', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle(/Simon Kuester/);
});

test('home shows the centered identity', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Simon Kuester' })).toBeVisible();
  await expect(page.getByText(/Genix Cyber/i)).toBeVisible();
});
