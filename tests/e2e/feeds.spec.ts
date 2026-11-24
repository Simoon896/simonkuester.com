import { test, expect } from '@playwright/test';

test('rss feed builds and lists posts', async ({ request }) => {
  const res = await request.get('/rss.xml');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain('<rss');
  // At least one post is listed (avoids hardcoding a title that may change).
  expect(body).toContain('<item>');
});

test('sitemap index is generated', async ({ request }) => {
  const res = await request.get('/sitemap-index.xml');
  expect(res.status()).toBe(200);
});

test('pages share a real PNG preview image', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://simonkuester.com/og.png');
  const res = await request.get('/og.png');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
});
