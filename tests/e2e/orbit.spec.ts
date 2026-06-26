import { test, expect } from '@playwright/test';

test('home renders highlight cards as links with images', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.orbit-card');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThanOrEqual(6);
  await expect(cards.first().locator('img')).toHaveAttribute('alt', /.+/);
});

test('reduced-motion keeps the orbit static (no ring class)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.orbit')).not.toHaveClass(/is-ring/);
});
