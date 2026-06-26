import { test, expect } from '@playwright/test';

const links = ['Home', 'About', 'Projects', 'Writing', 'Contact'];

test('primary nav exposes all links', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  for (const name of links) {
    await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
  }
});
