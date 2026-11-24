// Guards the Cloudflare deploy settings. Once wrangler.jsonc exists, Cloudflare
// deploys dist/ exactly as built, so these few lines decide the live 404 page
// and the old-URL redirects.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('Cloudflare deploy config', () => {
  it('targets the existing worker and serves the site 404 page', () => {
    const config = JSON.parse(read('wrangler.jsonc'));
    expect(config.name).toBe('simonkuester-website'); // must match the connected Worker or the build fails
    expect(config.assets.directory).toBe('./dist');
    expect(config.assets.not_found_handling).toBe('404-page');
    expect(config.main).toBeUndefined(); // static assets only, no Worker script
  });

  it('301s the old list pages to Work', () => {
    const rules = read('public/_redirects').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
    expect(rules).toContain('/projects/ /work/ 301');
    expect(rules).toContain('/writing/ /work/ 301');
  });
});
