import { test, expect } from '@playwright/test';

test('home renders the decorative blob field on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await expect(page.locator('[data-blob-field]')).toHaveAttribute('aria-hidden', 'true');
  expect(await page.locator('.bf-blob').count()).toBe(6);
});

test('blob field is hidden on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  const display = await page.locator('.blob-field').evaluate((el) => getComputedStyle(el).display);
  expect(display).toBe('none');
});

test('inner pages have no corner paint splotches', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/about/');
  await expect(page.locator('.splotches')).toHaveCount(0);
});

test('inner pages open on a statement and end with the onward row', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('.statement')).toHaveCount(1);
  const onward = page.locator('nav[aria-label="Other sections"]');
  await expect(onward.getByRole('link')).toHaveText(['Work', 'Contact']);
});
