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

test('inner pages render decorative paint splotches on wide screens', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/about/');
  await expect(page.locator('.splotches')).toHaveAttribute('aria-hidden', 'true');
  expect(await page.locator('.splotch').count()).toBe(3);
  const display = await page.locator('.splotches').evaluate((el) => getComputedStyle(el).display);
  expect(display).toBe('block');
});

test('paint splotches are hidden on smaller screens', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto('/about/');
  const display = await page.locator('.splotches').evaluate((el) => getComputedStyle(el).display);
  expect(display).toBe('none');
});
