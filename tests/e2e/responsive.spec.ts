import { test, expect } from '@playwright/test';

// 1044px sits just past the 1040px breakpoint where post and project pictures
// start running wider than the text column.
const widths = [360, 768, 1044, 1280];
const paths = [
  '/', '/about/', '/work/', '/contact/',
  '/writing/identity-week-america-2026/',
  '/projects/ai-detection-engineering-platform/',
];

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
