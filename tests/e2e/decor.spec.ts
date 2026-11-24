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

test('inner pages have no corner paint splotches', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/about/');
  await expect(page.locator('.splotches')).toHaveCount(0);
});

test('inner pages have no onward row; the footer links to every page', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('.statement')).toHaveCount(1);
  await expect(page.locator('nav[aria-label="Other sections"]')).toHaveCount(0);
  const footerNav = page.getByRole('navigation', { name: 'Footer' });
  await expect(footerNav.getByRole('link')).toHaveText(['Home', 'About', 'Work', 'Contact']);
  await expect(footerNav.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('href', '/');
  await expect(footerNav.getByRole('link', { name: 'About', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('footer has no copyright line; page links sit at its left edge', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/about/');
  const footer = page.locator('.site-footer');
  await expect(footer).not.toContainText('©');
  const box = await footer.boundingBox();
  const first = await page.getByRole('navigation', { name: 'Footer' }).getByRole('link').first().boundingBox();
  const pad = await footer.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft));
  expect(Math.abs(first!.x - (box!.x + pad))).toBeLessThanOrEqual(1);
});

test('cover scrim is the page colour in both themes, so switching theme shows no oval', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const read = () => page.evaluate(() => {
    const scrim = getComputedStyle(document.querySelector('.cover')!, '::before');
    const body = getComputedStyle(document.body);
    return { body: body.backgroundColor, scrim: scrim.backgroundColor, scrimMs: scrim.transitionDuration, bodyMs: body.transitionDuration };
  });
  const dark = await read();
  expect(dark.scrim).toBe(dark.body);
  expect(dark.scrimMs.split(',')[0].trim()).toBe(dark.bodyMs.split(',')[0].trim()); // they fade together
  await page.getByRole('button', { name: /toggle theme/i }).click();
  await expect.poll(async () => (await read()).body).toBe('rgb(250, 249, 247)');
  await expect.poll(async () => (await read()).scrim).toBe('rgb(250, 249, 247)');
});

test('home load-in animates only opacity and position, and fades each ball on its own', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const props = await page.locator('.hero > *').first().evaluate((el) => {
    const a = el.getAnimations()[0];
    return a ? Object.keys((a.effect as KeyframeEffect).getKeyframes()[0]) : [];
  });
  expect(props).toContain('opacity');
  expect(props).not.toContain('filter'); // blurring big type every frame is what made it choppy
  const field = await page.locator('.blob-field').evaluate((el) => getComputedStyle(el).animationName);
  expect(field).toBe('none');
  await expect(page.locator('.blob-field')).toHaveClass(/is-live/); // balls fade only once placed and moving
  const balls = await page.locator('.bf-blob').evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
  for (const b of balls) expect(b).not.toBe('none');
  for (const ball of await page.locator('.bf-blob').all()) await expect(ball).toHaveCSS('opacity', '1');
});

test('home text loads in from the top line down', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const lines = await page.locator('.hero > *').evaluateAll((els) =>
    els.map((el) => {
      const s = getComputedStyle(el);
      return { name: s.animationName, delay: parseFloat(s.animationDelay) };
    }),
  );
  expect(lines.length).toBe(4); // name, role, nav, hint
  for (const l of lines) expect(l.name).not.toBe('none');
  for (let i = 1; i < lines.length; i++) expect(lines[i].delay).toBeGreaterThan(lines[i - 1].delay);
});

test('home text finishes loading in and ends fully visible', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  for (const line of await page.locator('.hero > *').all()) {
    await expect(line).toHaveCSS('opacity', '1'); // waits for the animation to end
  }
  await expect(page.locator('.blob-field')).toHaveCSS('opacity', '1');
});

test('home text is simply there for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const names = await page.locator('.hero > *').evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
  for (const n of names) expect(n).toBe('none');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('opacity', '1');
  await expect(page.locator('.blob-field')).toHaveClass(/is-live/);
  for (const ball of await page.locator('.bf-blob').all()) await expect(ball).toHaveCSS('opacity', '1');
});
