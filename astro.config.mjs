// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://simonkuester.com',
  output: 'static',
  // Prefetch in-viewport links so the transition's reveal overlay is warm and
  // appears instantly as the bar sweeps (no load delay).
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
  integrations: [mdx(), sitemap()],
});
