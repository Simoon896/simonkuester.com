import { test, expect } from '@playwright/test';

test('about leads with the story and a fact rail', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('.statement')).toContainText('identity and access management');
  await expect(page.getByText('Minecraft')).toHaveCount(0);
  const rail = page.locator('.rail');
  await expect(rail).toContainText('Cybersecurity Engineering Associate');
  await expect(rail.getByRole('link', { name: 'Download resume (PDF)' })).toHaveAttribute('href', '/resume.pdf');
  await expect(page.getByText('Focus areas')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
});

test('work lists projects then writing as open rows', async ({ page }) => {
  await page.goto('/work/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Work');
  const groups = page.locator('main h2');
  await expect(groups.nth(0)).toHaveText('Projects');
  await expect(groups.nth(1)).toHaveText('Writing');
  await expect(page.getByRole('link', { name: 'AI-Driven Detection Engineering Platform', exact: true })).toHaveAttribute('href', '/projects/ai-detection-engineering-platform/');
  await expect(page.getByRole('link', { name: 'Demoing Argus at Identity Week America', exact: true })).toHaveAttribute('href', '/writing/identity-week-america-2026/');
});

test('work gives pictures real dimensions and leaves out missing ones', async ({ page }) => {
  await page.goto('/work/');
  await expect(page.locator('img[src="/uploads/project-1.png"]')).toHaveAttribute('width', '905');
  // the first post has no cover, so its row has no picture
  const firstPost = page.locator('article', { hasText: 'First post!' });
  await expect(firstPost.locator('img')).toHaveCount(0);
});

for (const old of ['/projects/', '/writing/']) {
  test(`${old} lands on /work/`, async ({ page }) => {
    await page.goto(old);
    await page.waitForURL('**/work/');
  });
}

test('existing detail URLs still resolve', async ({ request }) => {
  for (const p of [
    '/projects/ai-detection-engineering-platform/',
    '/projects/strongdm-argus-integration/',
    '/writing/building-this-site/',
    '/writing/identity-week-america-2026/',
  ]) {
    expect((await request.get(p)).status(), p).toBe(200);
  }
});

test('post with a cover leads with title, full-width photo and a rail', async ({ page }) => {
  await page.goto('/writing/identity-week-america-2026/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Demoing Argus at Identity Week America');
  const hero = page.locator('img.hero');
  await expect(hero).toHaveAttribute('alt', /booth/i);
  await expect(hero).toHaveAttribute('width', '1600');
  await expect(page.locator('.rail')).toContainText('Sep 6, 2026');
  await expect(page.locator('.rail').getByRole('link', { name: 'All work' })).toHaveAttribute('href', '/work/');
  await expect(page.locator('.prose img[src$="argus-booth.jpg"]')).toHaveCount(0); // cover not repeated in the text
});

test('post without a cover has no hero', async ({ page }) => {
  await page.goto('/writing/building-this-site/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('First post! The process of building my website');
  await expect(page.locator('img.hero')).toHaveCount(0);
  await expect(page.locator('.rail')).toContainText('Jun 27, 2026');
});

test('project page has a rail with tools and links', async ({ page }) => {
  await page.goto('/projects/ai-detection-engineering-platform/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('AI-Driven Detection Engineering Platform');
  await expect(page.locator('.rail')).toContainText('Atomic Red Team');
  await expect(page.locator('.rail').getByRole('link', { name: 'Repo' })).toBeVisible();
  await expect(page.locator('img.cover')).toHaveAttribute('width', '905');
});

test('contact is one screen with no onward row', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/contact/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact');
  await expect(page.getByRole('link', { name: 'simonkuester@gmail.com', exact: true })).toHaveAttribute('href', 'mailto:simonkuester@gmail.com');
  await expect(page.locator('nav[aria-label="Other sections"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
});

test('copy button works after a client-side navigation', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/about/');
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Contact' }).click();
  await page.waitForURL('**/contact/');
  await expect(page.locator('body')).toHaveAttribute('data-section', 'contact');
  await page.getByRole('button', { name: 'Copy email' }).click();
  await expect(page.getByRole('status')).toHaveText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('simonkuester@gmail.com');
});

test('404 offers all three sections', async ({ page }) => {
  await page.goto('/no-such-page/');
  await expect(page.locator('.statement')).toHaveText("That page doesn't exist.");
  await expect(page.locator('nav[aria-label="Other sections"] a')).toHaveText(['About', 'Work', 'Contact']);
});

for (const path of ['/about/', '/work/', '/contact/']) {
  test(`header wordmark lines up with the statement on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    const mark = await page.locator('.wordmark').boundingBox();
    const statement = await page.locator('.statement').boundingBox();
    expect(Math.abs(mark!.x - statement!.x)).toBeLessThanOrEqual(1);
  });
}
