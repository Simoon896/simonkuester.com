import { test, expect } from '@playwright/test';

// The header intro (name starts in the middle and slides left, the tabs slide out to
// the right) and what happens when you move between tabs.

const introDone = (page: import('@playwright/test').Page) =>
  expect(page.locator('html')).not.toHaveClass(/(^|\s)intro(\s|$)/, { timeout: 6000 });

test('inner page header plays its intro on first load, then rests in place', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/about/');
  await expect(page.locator('html')).toHaveClass(/(^|\s)intro(\s|$)/);
  const names = await page.evaluate(() => ({
    mark: getComputedStyle(document.querySelector('.wordmark')!).animationName,
    tabs: [...document.querySelectorAll('.site-header nav li')].map((li) => getComputedStyle(li).animationName),
    toggle: getComputedStyle(document.querySelector('.site-header #theme-toggle')!).animationName,
  }));
  expect(names.mark).not.toBe('none');
  for (const t of names.tabs) expect(t).not.toBe('none');
  expect(names.toggle).not.toBe('none');

  await introDone(page);
  const rest = await page.evaluate(() => ({
    mark: getComputedStyle(document.querySelector('.wordmark')!).animationName,
    opacity: getComputedStyle(document.querySelector('.site-header nav li')!).opacity,
  }));
  expect(rest.mark).toBe('none');
  expect(rest.opacity).toBe('1');
});

test('the name starts centred in the header and ends at its left edge', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/about/');
  // read the first keyframe of the wordmark's animation: it should put the name mid-header
  const start = await page.locator('.wordmark').evaluate((el) => {
    const header = el.closest('.site-header')!.getBoundingClientRect();
    const a = el.getAnimations()[0];
    a.pause(); a.currentTime = 0;
    const box = el.getBoundingClientRect();
    const out = { markCentre: box.x + box.width / 2, headerCentre: header.x + header.width / 2 };
    a.play();
    return out;
  });
  expect(Math.abs(start.markCentre - start.headerCentre)).toBeLessThanOrEqual(2);

  await introDone(page);
  const mark = await page.locator('.wordmark').boundingBox();
  const statement = await page.locator('.statement').boundingBox();
  expect(Math.abs(mark!.x - statement!.x)).toBeLessThanOrEqual(1);
});

test('the intro does not replay when moving between tabs', async ({ page }) => {
  await page.goto('/about/');
  await introDone(page);
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Work', exact: true }).click();
  await page.waitForURL('**/work/');
  await expect(page.locator('body')).toHaveAttribute('data-section', 'work');
  expect(await page.evaluate(() => document.documentElement.classList.contains('intro'))).toBe(false);
});

test('the intro plays when arriving from the home page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'About', exact: true }).click();
  await page.waitForURL('**/about/');
  await expect(page.locator('html')).toHaveClass(/(^|\s)intro(\s|$)/);
  await introDone(page);
});

test('reduced motion: no header intro', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/about/');
  const names = await page.evaluate(() => [
    getComputedStyle(document.querySelector('.wordmark')!).animationName,
    ...[...document.querySelectorAll('.site-header nav li')].map((li) => getComputedStyle(li).animationName),
  ]);
  for (const n of names) expect(n).toBe('none');
});

test('tab changes animate: the page content and the header dot are their own transition parts', async ({ page }) => {
  await page.goto('/about/');
  const parts = await page.evaluate(() => ({
    main: getComputedStyle(document.querySelector('main')!).viewTransitionName,
    header: getComputedStyle(document.querySelector('.site-header')!).viewTransitionName,
    dots: [...document.querySelectorAll('.site-header .nav-dot')].map((d) => getComputedStyle(d).viewTransitionName),
    dotParent: document.querySelector('.site-header .nav-dot')?.parentElement?.getAttribute('aria-current'),
  }));
  expect(parts.main).toBe('page');
  expect(parts.header).toBe('site-header');
  expect(parts.dots).toEqual(['nav-dot']); // one dot, on the current tab, free to glide to the next
  expect(parts.dotParent).toBe('page');
});

test('after a tab change the dot sits on the new tab in its colour', async ({ page }) => {
  await page.goto('/about/');
  await introDone(page);
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Work', exact: true }).click();
  await page.waitForURL('**/work/');
  const current = page.getByRole('navigation', { name: 'Primary' }).locator('[aria-current="page"]');
  await expect(current).toHaveText('Work');
  await expect(current.locator('.nav-dot')).toHaveCount(1);
  await expect(page.locator('.site-header .nav-dot')).toHaveCount(1);
});
