import { test, expect } from '@playwright/test';

const widths = [360, 768, 1280];
const paths = ['/', '/about/', '/projects/', '/writing/', '/contact/'];

for (const width of widths) {
  for (const path of paths) {
    test(`no horizontal scroll at ${width}px on ${path}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      );
      expect(overflow).toBe(false);
    });
  }
}
