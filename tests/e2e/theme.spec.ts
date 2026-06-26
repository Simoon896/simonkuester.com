import { test, expect } from '@playwright/test';

test('theme defaults to dark and toggle persists', async ({ page }) => {
  await page.goto('/about/');           // inner page always shows the header toggle
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: /toggle theme/i }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'light');
});
