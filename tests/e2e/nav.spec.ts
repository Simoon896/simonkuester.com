import { test, expect } from '@playwright/test';
const links = ['About', 'Work', 'Contact'];

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
  for (const name of links) {
    await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
  }
});

for (const path of ['/work/', '/writing/building-this-site/', '/projects/ai-detection-engineering-platform/']) {
  test(`header marks Work as current on ${path}`, async ({ page }) => {
    await page.goto(path);
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: 'Work', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  });
}
