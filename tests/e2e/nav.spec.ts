import { test, expect } from '@playwright/test';
const links = ['About', 'Projects', 'Writing', 'Contact'];

test('home hero nav exposes all links', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  for (const name of links) {
    await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
  }
});

test('inner pages keep the header nav', async ({ page }) => {
  await page.goto('/about/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link', { name: 'Projects', exact: true })).toBeVisible();
});
