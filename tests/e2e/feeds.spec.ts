import { test, expect } from '@playwright/test';

test('rss feed builds and lists posts', async ({ request }) => {
  const res = await request.get('/rss.xml');
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain('<rss');
  expect(body).toContain('Threat modeling for small teams');
});

test('sitemap index is generated', async ({ request }) => {
  const res = await request.get('/sitemap-index.xml');
  expect(res.status()).toBe(200);
});
