import { test, expect } from '@playwright/test';

const paths = ['/', '/about/', '/projects/', '/writing/', '/contact/'];

test('html has lang attribute', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

for (const path of paths) {
  test(`exactly one h1 on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
  });
}

test('skip-to-content link exists', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href="#main"]')).toHaveCount(1);
});

test('theme toggle is reachable on home', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible();
});
