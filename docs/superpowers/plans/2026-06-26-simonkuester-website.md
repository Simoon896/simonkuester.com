# simonkuester.com Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a fast, distinctive, minimal/editorial personal website for Simon Kuester (portfolio + blog) on Astro + Sveltia CMS + Cloudflare Pages, for $0/month beyond the domain.

**Architecture:** Static Astro site (zero client JS except a tiny theme toggle). Content lives as Markdown in two collections (`posts`, `projects`) edited via Sveltia CMS at `/admin`, which commits to the GitHub repo `Simoon896/simonkuester.com`. Cloudflare Pages builds and deploys on every push. DNS is managed at Cloudflare (nameservers moved from Namecheap).

**Tech Stack:** Astro 5 (TypeScript), Fontsource (self-hosted Fraunces + Inter), `@astrojs/mdx` + `@astrojs/sitemap` + `@astrojs/rss`, Sveltia CMS, a Cloudflare Worker OAuth proxy, Vitest (unit), Playwright (e2e), Lighthouse (perf/SEO).

**Reference spec:** `docs/superpowers/specs/2026-06-26-personal-website-design.md`

**Design tokens (single source of truth):**
- Light: Paper `#FAF9F7`, Ink `#1A1A1A`, Muted `#6F6A63`, Hairline `#E6E2DC`, Accent `#23406E`.
- Dark: Paper `#14110E`, Ink `#ECE7E0`, Muted `#9A938A`, Hairline `#2A2622`, Accent `#8FB0E0`.
- Type: headings **Fraunces Variable** (serif); body **Inter Variable** (sans). Prose measure `38rem`; page max `64rem`.

**Conventions used throughout:**
- Each task ends in a commit. Commit messages use Conventional Commits (`feat:`, `chore:`, `test:`, `docs:`).
- "Run … / Expected …" steps tell you exactly what success looks like.
- Placeholder content is realistic for a cybersecurity professional and is designed to be swapped via `/admin` later.

---

## File Structure

```
simonkuester.com/
├─ astro.config.mjs            # site URL, integrations
├─ package.json                # scripts + deps
├─ tsconfig.json               # (from Astro template)
├─ playwright.config.ts        # e2e config (builds + previews)
├─ vitest.config.ts            # unit test config
├─ public/
│  ├─ robots.txt
│  ├─ favicon.svg
│  ├─ resume.pdf               # placeholder, replaced later
│  ├─ uploads/                 # CMS-uploaded images land here
│  └─ admin/
│     ├─ index.html            # Sveltia CMS host page
│     └─ config.yml            # CMS collections + backend
├─ src/
│  ├─ styles/global.css        # design tokens + base styles
│  ├─ content.config.ts        # posts + projects collections (Astro 5)
│  ├─ layouts/BaseLayout.astro # <head>, SEO/OG, header, footer
│  ├─ components/
│  │  ├─ Header.astro
│  │  ├─ Footer.astro
│  │  ├─ ThemeToggle.astro
│  │  ├─ Container.astro
│  │  ├─ PostCard.astro
│  │  ├─ ProjectCard.astro
│  │  ├─ Tag.astro
│  │  └─ FormattedDate.astro
│  ├─ utils/
│  │  ├─ reading-time.ts
│  │  └─ reading-time.test.ts
│  ├─ content/
│  │  ├─ posts/*.md
│  │  └─ projects/*.md
│  └─ pages/
│     ├─ index.astro           # Home
│     ├─ about.astro
│     ├─ contact.astro
│     ├─ 404.astro
│     ├─ rss.xml.js
│     ├─ projects/index.astro
│     ├─ projects/[...slug].astro
│     ├─ writing/index.astro
│     └─ writing/[...slug].astro
├─ tests/e2e/
│  ├─ smoke.spec.ts
│  ├─ nav.spec.ts
│  ├─ theme.spec.ts
│  └─ responsive.spec.ts
└─ oauth-worker/               # separate Cloudflare Worker (Sveltia auth)
```

`oauth-worker/` is deployed independently of the site and is **not** part of the Astro build.

---

## Phase A — Foundation

### Task 1: Scaffold the Astro project

**Files:**
- Create: project files via the Astro CLI (in the existing repo root)
- Modify: `astro.config.mjs`, `package.json`

- [ ] **Step 1: Scaffold into the current directory**

The repo already exists (git initialized, with `docs/` and `.gitignore`). Scaffold Astro into it.

Run:
```bash
npm create astro@latest -- --template minimal --no-install --no-git --typescript strict --yes .
```
Expected: Astro creates `src/`, `public/`, `astro.config.mjs`, `package.json`, `tsconfig.json` in the current directory without overwriting `docs/` or `.git`. If it warns the directory is not empty, accept continuing.

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install
npm install @astrojs/mdx @astrojs/sitemap @astrojs/rss @fontsource-variable/fraunces @fontsource-variable/inter
npm install -D @astrojs/check typescript @playwright/test vitest
npx playwright install chromium
```
Expected: all install without error; `node_modules/` present (already git-ignored).

- [ ] **Step 3: Configure Astro**

Replace `astro.config.mjs` with:
```js
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://simonkuester.com',
  output: 'static',
  integrations: [mdx(), sitemap()],
});
```

- [ ] **Step 4: Set package.json scripts**

Ensure the `"scripts"` block in `package.json` is exactly:
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test:unit": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 5: Verify dev server boots**

Run:
```bash
npm run dev
```
Expected: server starts at `http://localhost:4321` with no errors. Stop it with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with mdx and sitemap"
```

---

### Task 2: Test tooling + first smoke test (TDD harness)

**Files:**
- Create: `vitest.config.ts`, `playwright.config.ts`, `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Add Vitest config**

Create `vitest.config.ts`:
```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: Add Playwright config**

Create `playwright.config.ts`:
```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 3: Write the failing smoke test**

Create `tests/e2e/smoke.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('home page loads and has a title', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Simon Kuester/);
});
```

- [ ] **Step 4: Run it to verify it fails**

Run:
```bash
npm run test:e2e
```
Expected: FAIL — the default scaffold title is not "Simon Kuester" yet. (This proves the harness works.)

- [ ] **Step 5: Commit the harness**

```bash
git add -A
git commit -m "test: add vitest and playwright harness with smoke test"
```

(The smoke test goes green in Task 4 once BaseLayout sets the title.)

---

### Task 3: Design tokens + global styles

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Write the tokens + base stylesheet**

Create `src/styles/global.css`:
```css
/* Self-hosted variable fonts */
@import '@fontsource-variable/fraunces';
@import '@fontsource-variable/inter';

:root {
  --paper: #FAF9F7;
  --ink: #1A1A1A;
  --muted: #6F6A63;
  --hairline: #E6E2DC;
  --accent: #23406E;
  --accent-contrast: #FFFFFF;
  --code-bg: #F4F2EE;

  --font-serif: 'Fraunces Variable', Georgia, serif;
  --font-sans: 'Inter Variable', system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, Menlo, Consolas, monospace;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 1rem;
  --space-4: 1.5rem;
  --space-5: 2.5rem;
  --space-6: 4rem;

  --maxw-prose: 38rem;
  --maxw-page: 64rem;
  --radius: 12px;
}

[data-theme='dark'] {
  --paper: #14110E;
  --ink: #ECE7E0;
  --muted: #9A938A;
  --hairline: #2A2622;
  --accent: #8FB0E0;
  --accent-contrast: #14110E;
  --code-bg: #1C1813;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 1.0625rem;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.2s ease, color 0.2s ease;
}

h1, h2, h3, h4 { font-family: var(--font-serif); font-weight: 600; line-height: 1.15; letter-spacing: -0.01em; }
h1 { font-size: clamp(2.2rem, 5vw, 3.1rem); }
h2 { font-size: clamp(1.5rem, 3vw, 2rem); }

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; text-underline-offset: 3px; }

:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 3px; }

img { max-width: 100%; height: auto; }

.prose { max-width: var(--maxw-prose); margin: 0 auto; }
.prose p, .prose ul, .prose ol { margin: 0 0 var(--space-3); }
.prose h2 { margin: var(--space-5) 0 var(--space-2); }
.prose blockquote {
  margin: var(--space-3) 0; padding: 0.25rem 0 0.25rem 1.1rem;
  border-left: 3px solid var(--accent); color: var(--muted); font-style: italic;
}
.prose pre {
  background: var(--code-bg); border: 1px solid var(--hairline);
  border-radius: var(--radius); padding: var(--space-3); overflow-x: auto; font-size: 0.9rem;
}
.prose code { font-family: var(--font-mono); font-size: 0.9em; }
.prose :not(pre) > code { background: var(--code-bg); padding: 0.1rem 0.35rem; border-radius: 5px; }

.meta { color: var(--muted); font-size: 0.9rem; }
.visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add design tokens and global styles (light + dark)"
```

---

## Phase B — Layout & components

### Task 4: BaseLayout with SEO/OpenGraph + theme bootstrap

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `public/favicon.svg`
- Test: `tests/e2e/smoke.spec.ts` (already written) should pass after this

- [ ] **Step 1: Add a favicon**

Create `public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#23406E"/>
  <text x="16" y="22" font-family="Georgia, serif" font-size="18" fill="#FAF9F7" text-anchor="middle">SK</text>
</svg>
```

- [ ] **Step 2: Write BaseLayout**

Create `src/layouts/BaseLayout.astro`:
```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
}

const {
  title,
  description = 'Simon Kuester — cybersecurity professional. Experience, projects, and writing.',
  image = '/favicon.svg',
  type = 'website',
} = Astro.props;

const fullTitle = title === 'Simon Kuester' ? title : `${title} — Simon Kuester`;
const canonical = new URL(Astro.url.pathname, Astro.site);
const ogImage = new URL(image, Astro.site);
---
<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href={canonical} />
    <link rel="alternate" type="application/rss+xml" title="Simon Kuester — Writing" href="/rss.xml" />

    <title>{fullTitle}</title>
    <meta name="description" content={description} />

    <meta property="og:type" content={type} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta name="twitter:card" content="summary_large_image" />

    <!-- Set theme before paint to avoid flash -->
    <script is:inline>
      (() => {
        const saved = localStorage.getItem('theme');
        const theme = saved
          ? saved
          : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
      })();
    </script>
  </head>
  <body>
    <a href="#main" class="visually-hidden">Skip to content</a>
    <Header />
    <main id="main">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 3: Create minimal Header/Footer placeholders so the build compiles**

Create `src/components/Header.astro`:
```astro
---
---
<header><nav aria-label="Primary"><a href="/">Simon Kuester</a></nav></header>
```

Create `src/components/Footer.astro`:
```astro
---
---
<footer><p class="meta">© 2026 Simon Kuester</p></footer>
```

(Full versions land in Tasks 5–6.)

- [ ] **Step 4: Point the home page at BaseLayout**

Replace `src/pages/index.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Simon Kuester">
  <p>Coming soon.</p>
</BaseLayout>
```

- [ ] **Step 5: Run the smoke test — it should now pass**

Run:
```bash
npm run test:e2e
```
Expected: PASS — status 200 and title matches `/Simon Kuester/`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add BaseLayout with SEO/OpenGraph and theme bootstrap"
```

---

### Task 5: Header, primary nav, and theme toggle

**Files:**
- Create: `src/components/ThemeToggle.astro`, `src/components/Container.astro`
- Modify: `src/components/Header.astro`
- Test: `tests/e2e/nav.spec.ts`, `tests/e2e/theme.spec.ts`

- [ ] **Step 1: Write the failing nav + theme tests**

Create `tests/e2e/nav.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

const links = ['Home', 'About', 'Projects', 'Writing', 'Contact'];

test('primary nav exposes all links', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  for (const name of links) {
    await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
  }
});
```

Create `tests/e2e/theme.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('theme toggle switches and persists across reload', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: /toggle theme/i }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
});
```

- [ ] **Step 2: Run them to verify they fail**

Run:
```bash
npm run test:e2e -- nav theme
```
Expected: FAIL — nav links and toggle button don't exist yet.

- [ ] **Step 3: Add a Container helper**

Create `src/components/Container.astro`:
```astro
---
interface Props { wide?: boolean; }
const { wide = false } = Astro.props;
---
<div class:list={['container', { wide }]}><slot /></div>
<style>
  .container { max-width: var(--maxw-prose); margin-inline: auto; padding-inline: var(--space-3); }
  .container.wide { max-width: var(--maxw-page); }
</style>
```

- [ ] **Step 4: Write the ThemeToggle**

Create `src/components/ThemeToggle.astro`:
```astro
---
---
<button id="theme-toggle" type="button" aria-label="Toggle theme">
  <span aria-hidden="true" class="icon-light">☀</span>
  <span aria-hidden="true" class="icon-dark">☾</span>
</button>
<style>
  #theme-toggle {
    background: none; border: 1px solid var(--hairline); border-radius: 8px;
    color: var(--ink); cursor: pointer; width: 38px; height: 38px; font-size: 1rem;
    display: inline-grid; place-items: center;
  }
  #theme-toggle:hover { border-color: var(--accent); }
  .icon-dark { display: none; }
  :global([data-theme='dark']) .icon-light { display: none; }
  :global([data-theme='dark']) .icon-dark { display: inline; }
</style>
<script is:inline>
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
</script>
```

- [ ] **Step 5: Write the full Header**

Replace `src/components/Header.astro`:
```astro
---
import ThemeToggle from './ThemeToggle.astro';
const path = Astro.url.pathname;
const items = [
  { href: '/', label: 'Home' },
  { href: '/about/', label: 'About' },
  { href: '/projects/', label: 'Projects' },
  { href: '/writing/', label: 'Writing' },
  { href: '/contact/', label: 'Contact' },
];
const isActive = (href: string) => href === '/' ? path === '/' : path.startsWith(href);
---
<header class="site-header">
  <a class="wordmark" href="/">Simon Kuester</a>
  <nav aria-label="Primary">
    <ul>
      {items.map((i) => (
        <li><a href={i.href} aria-current={isActive(i.href) ? 'page' : undefined}>{i.label}</a></li>
      ))}
    </ul>
  </nav>
  <ThemeToggle />
</header>
<style>
  .site-header {
    display: flex; align-items: center; gap: var(--space-4);
    max-width: var(--maxw-page); margin-inline: auto;
    padding: var(--space-3); border-bottom: 1px solid var(--hairline);
    flex-wrap: wrap;
  }
  .wordmark { font-family: var(--font-serif); font-size: 1.15rem; color: var(--ink); }
  nav { margin-inline-start: auto; }
  nav ul { display: flex; gap: var(--space-3); list-style: none; margin: 0; padding: 0; flex-wrap: wrap; }
  nav a { color: var(--muted); font-size: 0.95rem; }
  nav a[aria-current='page'] { color: var(--ink); font-weight: 500; }
  nav a:hover { color: var(--accent); }
</style>
```

- [ ] **Step 6: Run the tests — they should pass**

Run:
```bash
npm run test:e2e -- nav theme
```
Expected: PASS for both nav and theme specs.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add header nav and persistent theme toggle"
```

---

### Task 6: Footer

**Files:**
- Modify: `src/components/Footer.astro`

- [ ] **Step 1: Write the full Footer**

Replace `src/components/Footer.astro`:
```astro
---
const year = 2026;
const socials = [
  { href: 'https://github.com/Simoon896', label: 'GitHub' },
  { href: 'https://www.linkedin.com/', label: 'LinkedIn' },
  { href: 'mailto:simonkuester@gmail.com', label: 'Email' },
  { href: '/rss.xml', label: 'RSS' },
];
---
<footer class="site-footer">
  <p class="meta">© {year} Simon Kuester</p>
  <ul>
    {socials.map((s) => <li><a href={s.href}>{s.label}</a></li>)}
  </ul>
</footer>
<style>
  .site-footer {
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2);
    max-width: var(--maxw-page); margin: var(--space-6) auto 0; padding: var(--space-3);
    border-top: 1px solid var(--hairline);
  }
  .site-footer ul { display: flex; gap: var(--space-3); list-style: none; margin: 0; padding: 0; }
  .site-footer a { color: var(--muted); font-size: 0.9rem; }
  .site-footer a:hover { color: var(--accent); }
</style>
```
> Note: replace the LinkedIn URL with the real profile when known (placeholder strategy).

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add site footer with social links"
```

---

### Task 7: Utility (reading time) + shared UI components

**Files:**
- Create: `src/utils/reading-time.ts`, `src/utils/reading-time.test.ts`
- Create: `src/components/FormattedDate.astro`, `src/components/Tag.astro`, `src/components/PostCard.astro`, `src/components/ProjectCard.astro`

- [ ] **Step 1: Write the failing unit test**

Create `src/utils/reading-time.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readingTime } from './reading-time';

describe('readingTime', () => {
  it('returns at least 1 min for short text', () => {
    expect(readingTime('hello world')).toBe('1 min read');
  });

  it('scales with word count (~200 wpm)', () => {
    const text = Array.from({ length: 400 }, () => 'word').join(' ');
    expect(readingTime(text)).toBe('2 min read');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run:
```bash
npm run test:unit
```
Expected: FAIL — `reading-time.ts` does not exist.

- [ ] **Step 3: Implement the utility**

Create `src/utils/reading-time.ts`:
```ts
const WORDS_PER_MINUTE = 200;

export function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run:
```bash
npm run test:unit
```
Expected: PASS (2 tests).

- [ ] **Step 5: Add FormattedDate**

Create `src/components/FormattedDate.astro`:
```astro
---
interface Props { date: Date; }
const { date } = Astro.props;
const formatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
---
<time datetime={date.toISOString()}>{formatted}</time>
```

- [ ] **Step 6: Add Tag**

Create `src/components/Tag.astro`:
```astro
---
interface Props { label: string; }
const { label } = Astro.props;
---
<span class="tag">{label}</span>
<style>
  .tag {
    display: inline-block; font-size: 0.75rem; color: var(--accent);
    border: 1px solid var(--hairline); border-radius: 999px; padding: 0.15rem 0.6rem;
  }
</style>
```

- [ ] **Step 7: Add PostCard**

Create `src/components/PostCard.astro`:
```astro
---
import FormattedDate from './FormattedDate.astro';
interface Props { href: string; title: string; date: Date; summary: string; }
const { href, title, date, summary } = Astro.props;
---
<article class="card">
  <a href={href} class="card-link">
    <h3>{title}</h3>
    <p class="meta"><FormattedDate date={date} /></p>
    <p class="summary">{summary}</p>
    <span class="more">Read →</span>
  </a>
</article>
<style>
  .card { border-bottom: 1px solid var(--hairline); padding: var(--space-4) 0; }
  .card h3 { margin: 0 0 var(--space-1); }
  .card .summary { color: var(--ink); margin: var(--space-2) 0; }
  .card .more { color: var(--accent); font-size: 0.9rem; }
  .card-link { color: inherit; display: block; }
  .card-link:hover { text-decoration: none; }
  .card-link:hover h3 { color: var(--accent); }
</style>
```

- [ ] **Step 8: Add ProjectCard**

Create `src/components/ProjectCard.astro`:
```astro
---
import Tag from './Tag.astro';
interface Props { href: string; title: string; summary: string; tools: string[]; }
const { href, title, summary, tools } = Astro.props;
---
<a class="project-card" href={href}>
  <h3>{title}</h3>
  <p class="summary">{summary}</p>
  <div class="tools">{tools.map((t) => <Tag label={t} />)}</div>
</a>
<style>
  .project-card {
    display: block; color: inherit; border: 1px solid var(--hairline);
    border-radius: var(--radius); padding: var(--space-4); height: 100%;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }
  .project-card:hover { border-color: var(--accent); transform: translateY(-2px); text-decoration: none; }
  .project-card h3 { margin: 0 0 var(--space-2); }
  .project-card .summary { color: var(--muted); margin: 0 0 var(--space-3); }
  .tools { display: flex; gap: var(--space-2); flex-wrap: wrap; }
</style>
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add reading-time util (tested) and shared UI components"
```

---

## Phase C — Content collections & pages

### Task 8: Content collections + placeholder content

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/posts/threat-modeling-small-teams.md`, `src/content/posts/reading-logs-that-matter.md`
- Create: `src/content/projects/internal-phishing-range.md`, `src/content/projects/secrets-scanner.md`

- [ ] **Step 1: Define the collections (Astro 5 glob loader)**

Create `src/content.config.ts`:
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    period: z.string(),
    tools: z.array(z.string()).default([]),
    summary: z.string(),
    links: z.array(z.object({ label: z.string(), url: z.string().url() })).default([]),
    coverImage: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

export const collections = { posts, projects };
```

> **Design note (refines spec §6):** the project case-study sections (challenge / contribution / decisions / outcome) live in the Markdown **body** as `##` headings rather than separate frontmatter fields. This keeps the CMS editor to one rich body and renders cleanly. Metadata stays in frontmatter. The CMS body field hint (Task 16) documents the expected headings.

- [ ] **Step 2: Add two placeholder posts**

Create `src/content/posts/threat-modeling-small-teams.md`:
```md
---
title: "Threat modeling for small teams"
date: 2026-05-12
summary: "A lightweight threat-modeling process for teams without a dedicated security function."
tags: ["threat-modeling", "appsec"]
draft: false
---

Most threat models die in a spreadsheet nobody opens twice. The ones that survive
are small, specific, and revisited.

> Start with what an attacker wants, not with the tools you happen to own.

## Start with assets, not tools

List what's actually worth stealing or breaking. Everything else follows from there.

## Keep it to one page

If it doesn't fit on a page, it won't get re-read. Constrain scope deliberately.
```

Create `src/content/posts/reading-logs-that-matter.md`:
```md
---
title: "Reading logs that actually matter"
date: 2026-06-01
summary: "Signal beats volume: a few high-value log sources beat ingesting everything."
tags: ["detection", "blue-team"]
draft: false
---

You don't need every log. You need the few that change your decisions.

## Pick sources by question

For each alert you care about, ask which log answers it. Ingest those first.
```

- [ ] **Step 3: Add two placeholder projects**

Create `src/content/projects/internal-phishing-range.md`:
```md
---
title: "Internal phishing range"
role: "Designed and built the platform end to end"
period: "2024–2025"
tools: ["Python", "Docker", "Terraform"]
summary: "Cut click-through on simulated phishing by 60% with a self-service training range."
links:
  - label: "Write-up"
    url: "https://example.com/phishing-range"
featured: true
order: 1
---

## Challenge
Security awareness training was annual, generic, and ignored. Click-through on
real phishing stayed high.

## Contribution
I designed and built a self-service phishing simulation range that teams could
run against themselves on demand.

## Key decisions
Isolated every simulation in disposable containers; templated campaigns in code
so results were reproducible and auditable.

## Outcome
Click-through on simulated campaigns dropped ~60% over two quarters, and three
teams adopted it without prompting.
```

Create `src/content/projects/secrets-scanner.md`:
```md
---
title: "Pre-commit secrets scanner"
role: "Author and maintainer"
period: "2023"
tools: ["Go", "Git hooks"]
summary: "A fast pre-commit hook that keeps credentials out of source control."
links:
  - label: "Repo"
    url: "https://github.com/Simoon896"
featured: true
order: 2
---

## Challenge
Credentials kept landing in commits and getting caught too late, in review.

## Contribution
Wrote a fast Go pre-commit hook that scans staged diffs for high-entropy strings
and known token formats.

## Key decisions
Optimized for sub-200ms runs so developers wouldn't disable it; tuned signatures
to keep false positives low.

## Outcome
Zero secrets reached the default branch in the year after rollout.
```

- [ ] **Step 4: Verify content types compile**

Run:
```bash
npm run check
```
Expected: 0 errors (schemas validate against the placeholder content).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: define posts and projects collections with placeholder content"
```

---

### Task 9: Home page

**Files:**
- Modify: `src/pages/index.astro`
- Test: `tests/e2e/smoke.spec.ts` still passes; add a home content assertion

- [ ] **Step 1: Extend the smoke test for home content**

Append to `tests/e2e/smoke.spec.ts`:
```ts
test('home shows hero and featured sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Featured projects' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Latest writing' })).toBeVisible();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:e2e -- smoke`
Expected: FAIL — those headings don't exist yet.

- [ ] **Step 3: Build the Home page**

Replace `src/pages/index.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import Container from '../components/Container.astro';
import ProjectCard from '../components/ProjectCard.astro';
import PostCard from '../components/PostCard.astro';

const projects = (await getCollection('projects'))
  .filter((p) => p.data.featured)
  .sort((a, b) => a.data.order - b.data.order)
  .slice(0, 4);

const posts = (await getCollection('posts', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 3);
---
<BaseLayout title="Simon Kuester">
  <Container>
    <section class="hero">
      <h1>Simon Kuester</h1>
      <p class="lede">Cybersecurity professional. I secure systems, break them on
        purpose, and write about what I learn along the way.</p>
      <div class="cta">
        <a class="btn" href="/projects/">View my work</a>
        <a class="btn-ghost" href="/resume.pdf">Résumé →</a>
      </div>
    </section>
  </Container>

  <Container wide>
    <section>
      <h2>Featured projects</h2>
      <div class="grid">
        {projects.map((p) => (
          <ProjectCard href={`/projects/${p.id}/`} title={p.data.title} summary={p.data.summary} tools={p.data.tools} />
        ))}
      </div>
    </section>
  </Container>

  <Container>
    <section>
      <h2>Latest writing</h2>
      {posts.map((p) => (
        <PostCard href={`/writing/${p.id}/`} title={p.data.title} date={p.data.date} summary={p.data.summary} />
      ))}
      <p><a href="/writing/">All writing →</a></p>
    </section>
  </Container>
</BaseLayout>

<style>
  .hero { padding: var(--space-6) 0 var(--space-5); }
  .lede { font-size: 1.25rem; color: var(--muted); max-width: 32em; }
  .cta { display: flex; gap: var(--space-3); margin-top: var(--space-4); align-items: center; flex-wrap: wrap; }
  .btn { background: var(--accent); color: var(--accent-contrast); padding: 0.6rem 1.2rem; border-radius: 8px; }
  .btn:hover { text-decoration: none; opacity: 0.92; }
  .btn-ghost { color: var(--accent); }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3); }
  section { margin-block: var(--space-5); }
</style>
```

- [ ] **Step 4: Run the test — it should pass**

Run: `npm run test:e2e -- smoke`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: build home page with hero, featured projects, latest writing"
```

---

### Task 10: About page (bio + experience + résumé)

**Files:**
- Modify/Create: `src/pages/about.astro`, `public/resume.pdf` (placeholder)

- [ ] **Step 1: Add a placeholder résumé file**

Create `public/resume.pdf` with placeholder text content (replaced with the real PDF later):
```bash
printf '%%PDF-1.4 placeholder resume - replace before launch\n' > public/resume.pdf
```
> Replace `public/resume.pdf` with the real résumé before going live.

- [ ] **Step 2: Build the About page**

Create `src/pages/about.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Container from '../components/Container.astro';

const focus = ['Application security', 'Detection engineering', 'Cloud security', 'Security tooling'];
const experience = [
  { period: '2024–present', role: 'Security Engineer', org: 'Placeholder Co.', note: 'Application & cloud security; built internal tooling.' },
  { period: '2021–2024', role: 'Security Analyst', org: 'Placeholder Inc.', note: 'Detection engineering and incident response.' },
];
---
<BaseLayout title="About" description="About Simon Kuester — background, focus areas, and experience.">
  <Container>
    <h1>About</h1>
    <p class="lede">I'm a cybersecurity professional focused on making complex risk
      understandable and building tools that make secure the default.</p>

    <h2>Focus areas</h2>
    <ul class="focus">{focus.map((f) => <li>{f}</li>)}</ul>

    <h2>Experience</h2>
    <ul class="timeline">
      {experience.map((e) => (
        <li>
          <p class="meta">{e.period}</p>
          <p class="role"><strong>{e.role}</strong> · {e.org}</p>
          <p>{e.note}</p>
        </li>
      ))}
    </ul>

    <p><a class="btn" href="/resume.pdf">Download résumé (PDF)</a></p>
  </Container>
</BaseLayout>

<style>
  .lede { font-size: 1.2rem; color: var(--muted); }
  .focus { display: flex; gap: var(--space-2); flex-wrap: wrap; list-style: none; padding: 0; }
  .focus li { border: 1px solid var(--hairline); border-radius: 999px; padding: 0.2rem 0.7rem; font-size: 0.85rem; }
  .timeline { list-style: none; padding: 0; }
  .timeline li { border-left: 2px solid var(--hairline); padding: 0 0 var(--space-4) var(--space-3); }
  .timeline .role { margin: 0.1rem 0; }
  .btn { display: inline-block; background: var(--accent); color: var(--accent-contrast); padding: 0.6rem 1.2rem; border-radius: 8px; }
  .btn:hover { text-decoration: none; opacity: 0.92; }
</style>
```

- [ ] **Step 3: Verify build + commit**

Run: `npm run build`
Expected: success.

```bash
git add -A
git commit -m "feat: build about page with focus areas, experience, resume link"
```

---

### Task 11: Projects index + detail (case study)

**Files:**
- Create: `src/pages/projects/index.astro`, `src/pages/projects/[...slug].astro`

- [ ] **Step 1: Build the Projects index**

Create `src/pages/projects/index.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Container from '../../components/Container.astro';
import ProjectCard from '../../components/ProjectCard.astro';

const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout title="Projects" description="Selected security projects and case studies by Simon Kuester.">
  <Container wide>
    <h1>Projects</h1>
    <p class="lede">Selected work, written up as short case studies.</p>
    <div class="grid">
      {projects.map((p) => (
        <ProjectCard href={`/projects/${p.id}/`} title={p.data.title} summary={p.data.summary} tools={p.data.tools} />
      ))}
    </div>
  </Container>
</BaseLayout>
<style>
  .lede { color: var(--muted); }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-3); margin-top: var(--space-4); }
</style>
```

- [ ] **Step 2: Build the Project detail page**

Create `src/pages/projects/[...slug].astro`:
```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Container from '../../components/Container.astro';
import Tag from '../../components/Tag.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({ params: { slug: project.id }, props: { project } }));
}

const { project } = Astro.props;
const { Content } = await render(project);
const d = project.data;
---
<BaseLayout title={d.title} description={d.summary} type="article">
  <Container>
    <article class="prose">
      <p class="meta">{d.role} · {d.period}</p>
      <h1>{d.title}</h1>
      <p class="lede">{d.summary}</p>
      <div class="tools">{d.tools.map((t) => <Tag label={t} />)}</div>
      <Content />
      {d.links.length > 0 && (
        <p class="links">{d.links.map((l) => <a href={l.url}>{l.label} →</a>)}</p>
      )}
      <p><a href="/projects/">← All projects</a></p>
    </article>
  </Container>
</BaseLayout>
<style>
  .lede { font-size: 1.15rem; color: var(--muted); }
  .tools { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-4); }
  .links { display: flex; gap: var(--space-4); }
</style>
```

- [ ] **Step 3: Verify both routes build**

Run: `npm run build`
Expected: build emits `/projects/index.html`, `/projects/internal-phishing-range/index.html`, `/projects/secrets-scanner/index.html`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: build projects index and case-study detail pages"
```

---

### Task 12: Writing index + post detail

**Files:**
- Create: `src/pages/writing/index.astro`, `src/pages/writing/[...slug].astro`

- [ ] **Step 1: Build the Writing index**

Create `src/pages/writing/index.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Container from '../../components/Container.astro';
import PostCard from '../../components/PostCard.astro';

const posts = (await getCollection('posts', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<BaseLayout title="Writing" description="Writing on cybersecurity by Simon Kuester.">
  <Container>
    <h1>Writing</h1>
    <p class="lede">Notes on security, detection, and building safer systems.</p>
    {posts.map((p) => (
      <PostCard href={`/writing/${p.id}/`} title={p.data.title} date={p.data.date} summary={p.data.summary} />
    ))}
  </Container>
</BaseLayout>
<style>.lede { color: var(--muted); }</style>
```

- [ ] **Step 2: Build the Post detail page**

Create `src/pages/writing/[...slug].astro`:
```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Container from '../../components/Container.astro';
import FormattedDate from '../../components/FormattedDate.astro';
import Tag from '../../components/Tag.astro';
import { readingTime } from '../../utils/reading-time';

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);
const d = post.data;
---
<BaseLayout title={d.title} description={d.summary} type="article">
  <Container>
    <article class="prose">
      <p class="meta"><FormattedDate date={d.date} /> · {readingTime(post.body ?? '')}</p>
      <h1>{d.title}</h1>
      <Content />
      <div class="tags">{d.tags.map((t) => <Tag label={t} />)}</div>
      <p><a href="/writing/">← All writing</a></p>
    </article>
  </Container>
</BaseLayout>
<style>.tags { display: flex; gap: var(--space-2); flex-wrap: wrap; margin: var(--space-4) 0; }</style>
```

- [ ] **Step 3: Verify build + commit**

Run: `npm run build`
Expected: emits `/writing/index.html` and a page per post.

```bash
git add -A
git commit -m "feat: build writing index and post detail pages"
```

---

### Task 13: Contact page

**Files:**
- Create: `src/pages/contact.astro`

- [ ] **Step 1: Build the Contact page**

Create `src/pages/contact.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Container from '../components/Container.astro';

const links = [
  { label: 'Email', value: 'simonkuester@gmail.com', href: 'mailto:simonkuester@gmail.com' },
  { label: 'GitHub', value: 'github.com/Simoon896', href: 'https://github.com/Simoon896' },
  { label: 'LinkedIn', value: 'View profile', href: 'https://www.linkedin.com/' },
];
---
<BaseLayout title="Contact" description="Get in touch with Simon Kuester.">
  <Container>
    <h1>Contact</h1>
    <p class="lede">The fastest way to reach me is email. I'm open to roles and
      interesting security problems.</p>
    <ul class="contacts">
      {links.map((l) => (
        <li><span class="label">{l.label}</span> <a href={l.href}>{l.value}</a></li>
      ))}
    </ul>
  </Container>
</BaseLayout>
<style>
  .lede { color: var(--muted); max-width: 32em; }
  .contacts { list-style: none; padding: 0; }
  .contacts li { padding: var(--space-2) 0; border-bottom: 1px solid var(--hairline); }
  .label { display: inline-block; width: 6rem; color: var(--muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.06em; }
</style>
```
> Replace the LinkedIn URL with the real profile when known.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: build contact page"
```

---

### Task 14: 404 page

**Files:**
- Create: `src/pages/404.astro`

- [ ] **Step 1: Build the 404**

Create `src/pages/404.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Container from '../components/Container.astro';
---
<BaseLayout title="Not found" description="Page not found.">
  <Container>
    <h1>404</h1>
    <p class="lede">That page doesn't exist.</p>
    <p><a href="/">← Back home</a></p>
  </Container>
</BaseLayout>
<style>.lede { color: var(--muted); }</style>
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add 404 page"
```

---

## Phase D — SEO, feeds, robots

### Task 15: RSS feed + robots.txt (sitemap already configured)

**Files:**
- Create: `src/pages/rss.xml.js`, `public/robots.txt`
- Test: `tests/e2e/feeds.spec.ts`

- [ ] **Step 1: Write the failing feed test**

Create `tests/e2e/feeds.spec.ts`:
```ts
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:e2e -- feeds`
Expected: FAIL — `/rss.xml` returns 404.

- [ ] **Step 3: Implement the RSS endpoint**

Create `src/pages/rss.xml.js`:
```js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: 'Simon Kuester — Writing',
    description: 'Writing on cybersecurity by Simon Kuester.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.summary,
      pubDate: post.data.date,
      link: `/writing/${post.id}/`,
    })),
  });
}
```

- [ ] **Step 4: Add robots.txt**

Create `public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://simonkuester.com/sitemap-index.xml
```

- [ ] **Step 5: Run the test — it should pass**

Run: `npm run test:e2e -- feeds`
Expected: PASS (both feed + sitemap).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add rss feed and robots.txt"
```

---

## Phase E — Sveltia CMS

### Task 16: Sveltia CMS admin (collections)

**Files:**
- Create: `public/admin/index.html`, `public/admin/config.yml`
- Create: `public/uploads/.gitkeep`

- [ ] **Step 1: Add the CMS host page**

Create `public/admin/index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Content Manager · Simon Kuester</title>
  </head>
  <body>
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Add the CMS config**

Create `public/admin/config.yml`:
```yaml
backend:
  name: github
  repo: Simoon896/simonkuester.com
  branch: main
  base_url: https://REPLACE-WITH-OAUTH-WORKER.workers.dev

media_folder: "public/uploads"
public_folder: "/uploads"

collections:
  - name: "posts"
    label: "Writing"
    folder: "src/content/posts"
    create: true
    slug: "{{slug}}"
    extension: "md"
    format: "frontmatter"
    fields:
      - { name: "title", label: "Title", widget: "string" }
      - { name: "date", label: "Date", widget: "datetime", picker_utc: false }
      - { name: "summary", label: "Summary", widget: "text" }
      - { name: "tags", label: "Tags", widget: "list", default: [], required: false }
      - { name: "coverImage", label: "Cover image", widget: "image", required: false }
      - { name: "draft", label: "Draft", widget: "boolean", default: false }
      - { name: "body", label: "Body", widget: "markdown" }

  - name: "projects"
    label: "Projects"
    folder: "src/content/projects"
    create: true
    slug: "{{slug}}"
    extension: "md"
    format: "frontmatter"
    fields:
      - { name: "title", label: "Title", widget: "string" }
      - { name: "role", label: "Your role", widget: "string" }
      - { name: "period", label: "Period", widget: "string", hint: "e.g. 2024–2025" }
      - { name: "tools", label: "Tools", widget: "list", default: [] }
      - { name: "summary", label: "Summary", widget: "text", hint: "Lead with problem + outcome" }
      - name: "links"
        label: "Links"
        widget: "list"
        required: false
        fields:
          - { name: "label", label: "Label", widget: "string" }
          - { name: "url", label: "URL", widget: "string" }
      - { name: "coverImage", label: "Cover image", widget: "image", required: false }
      - { name: "featured", label: "Featured on home", widget: "boolean", default: false }
      - { name: "order", label: "Sort order", widget: "number", default: 0, value_type: "int" }
      - name: "body"
        label: "Case study"
        widget: "markdown"
        hint: "Use ## Challenge, ## Contribution, ## Key decisions, ## Outcome"
```
> `base_url` is filled in after Task 17 deploys the OAuth worker.

- [ ] **Step 3: Keep the uploads folder in git**

Run:
```bash
mkdir -p public/uploads && printf '' > public/uploads/.gitkeep
```

- [ ] **Step 4: Verify admin is served**

Run:
```bash
npm run build && npm run preview
```
Then in another shell:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/admin/
```
Expected: `200`. Stop preview afterward.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Sveltia CMS admin with posts and projects collections"
```

---

### Task 17: GitHub OAuth worker (Cloudflare) for CMS auth

**Files:**
- Create: `oauth-worker/` (separate Cloudflare Worker project)

This worker performs the GitHub OAuth handshake so `/admin` can log in. It deploys to Cloudflare independently of the site.

- [ ] **Step 1: Create a GitHub OAuth App**

In GitHub (account `Simoon896`) → Settings → Developer settings → OAuth Apps → New OAuth App:
- Application name: `simonkuester.com CMS`
- Homepage URL: `https://simonkuester.com`
- Authorization callback URL: `https://simonkuester-cms-auth.<your-subdomain>.workers.dev/callback` (you'll confirm the exact worker URL in Step 4; update if needed)

Save the **Client ID** and generate a **Client Secret**.

- [ ] **Step 2: Scaffold the worker from the Sveltia auth reference**

Run:
```bash
git clone https://github.com/sveltia/sveltia-cms-auth.git oauth-worker
cd oauth-worker
npm install
```
> This is the maintained OAuth proxy for Sveltia/Decap. Review the source before deploying (good practice — it's the auth boundary).

- [ ] **Step 3: Configure allowed domains**

Edit `oauth-worker/wrangler.toml` and set the `ALLOWED_DOMAINS` var to `simonkuester.com` (and add `localhost` if you want local CMS testing). Confirm `name = "simonkuester-cms-auth"`.

- [ ] **Step 4: Authenticate and deploy**

Run:
```bash
npx wrangler login
npx wrangler deploy
```
Expected: prints the deployed worker URL, e.g. `https://simonkuester-cms-auth.<subdomain>.workers.dev`. Note it.

- [ ] **Step 5: Set the OAuth secrets**

Run (paste each value when prompted):
```bash
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```

- [ ] **Step 6: Wire the worker URL into the CMS**

Update `public/admin/config.yml` `base_url` to the deployed worker URL (no trailing slash). Also confirm the GitHub OAuth App callback URL matches `<worker-url>/callback`.

- [ ] **Step 7: Commit the site change**

```bash
cd ..
git add public/admin/config.yml
git commit -m "chore: point CMS auth at deployed oauth worker"
```
> `oauth-worker/` has its own git repo from the clone; it is not committed into the site repo.

---

## Phase F — Verify & Deploy

### Task 18: Quality pass — responsive, accessibility, performance

**Files:**
- Create: `tests/e2e/responsive.spec.ts`

- [ ] **Step 1: Write responsive checks at key breakpoints**

Create `tests/e2e/responsive.spec.ts`:
```ts
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
```

- [ ] **Step 2: Run the full e2e suite**

Run:
```bash
npm run test:e2e
```
Expected: all specs (smoke, nav, theme, feeds, responsive) PASS. Fix any layout overflow before continuing.

- [ ] **Step 3: Run Lighthouse against the production build**

Run:
```bash
npm run build && npm run preview &
npx lighthouse http://localhost:4321/ --quiet --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless" --output=json --output-path=./lighthouse-home.json
```
Expected: Performance, Accessibility, Best Practices, SEO all ≥ 0.95. Stop the preview server after. Investigate and fix anything below 0.95 (common fixes: image dimensions, color contrast in dark mode, missing labels).

- [ ] **Step 4: Manual accessibility spot-check**

Tab through Home with the keyboard: skip-link works, focus is visible on every interactive element, the theme toggle is reachable and announces "Toggle theme". Confirm contrast in both themes.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: add responsive checks and verify a11y/perf budgets"
```

---

### Task 19: Push to GitHub

- [ ] **Step 1: Create the remote repo**

Create `https://github.com/Simoon896/simonkuester.com` (empty, no README) via the GitHub UI, or with the CLI if authenticated:
```bash
gh repo create Simoon896/simonkuester.com --private --source=. --remote=origin --push
```
If not using `gh`, run:
```bash
git remote add origin https://github.com/Simoon896/simonkuester.com.git
git push -u origin main
```
Expected: `main` is pushed; all commits present on GitHub.

> Decide public vs private. A public repo is fine and common for a portfolio; if private, Cloudflare Pages still builds it after you authorize access.

---

### Task 20: Deploy to Cloudflare Pages + custom domain (Namecheap DNS)

- [ ] **Step 1: Create the Pages project**

In the Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → authorize GitHub → select `Simoon896/simonkuester.com`. Build settings:
- Framework preset: **Astro**
- Build command: `npm run build`
- Build output directory: `dist`

Deploy. Expected: a build runs and the site is live at `https://simonkuester-com.pages.dev` (or similar). Open it and confirm pages render.

- [ ] **Step 2: Move DNS to Cloudflare**

In Cloudflare → add a site → enter `simonkuester.com` → choose the Free plan. Cloudflare scans existing DNS and gives you **two nameservers**.

In **Namecheap** → Domain List → `simonkuester.com` → Manage → Nameservers → choose **Custom DNS** → enter Cloudflare's two nameservers → save. (Propagation: minutes to a few hours.)

- [ ] **Step 3: Attach the custom domain to Pages**

In the Pages project → Custom domains → add `simonkuester.com` and `www.simonkuester.com`. Cloudflare creates the DNS records automatically (CNAME flattening handles the apex). SSL provisions automatically.

Expected: `https://simonkuester.com` serves the site with a valid certificate.

- [ ] **Step 4: Verify the CMS end to end**

Visit `https://simonkuester.com/admin/`, log in with GitHub, create a test post, and publish. Expected: Sveltia commits to the repo → Cloudflare rebuilds → the post appears at `/writing/` within ~1 minute. Delete the test post afterward.

- [ ] **Step 5: Production smoke + Lighthouse**

Run:
```bash
npx lighthouse https://simonkuester.com/ --quiet --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless"
```
Expected: all categories ≥ 0.95. Confirm OpenGraph preview with a sharing debugger (e.g., paste the URL into a social preview tool) shows the correct title/description.

- [ ] **Step 6: Final commit / tag**

```bash
git commit --allow-empty -m "chore: v1 live at simonkuester.com"
git push
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Goals/success criteria (fast, a11y, responsive, distinctive, easy-publish, $0, SEO) → Tasks 3, 5, 15, 18, 20 (Lighthouse + a11y + responsive + RSS/sitemap/OG).
- Scope: 5 pages → Tasks 9–14. Light/dark default-light → Tasks 3–5. Sveltia posts+projects → Tasks 8, 16. RSS/sitemap/OG/favicon → Tasks 4, 15.
- Architecture/stack → Tasks 1, 16, 17, 19, 20.
- Content model → Task 8 (with documented refinement: case-study narrative in body).
- Design system tokens/components/motion → Tasks 3, 5–7.
- Deployment (Namecheap → Cloudflare, OAuth worker) → Tasks 17, 19, 20.
- Non-goals respected: no backend/db, no comments, no paid services, no heavy JS framework.

**Placeholder scan:** Content is intentionally placeholder per spec §11.3 and flagged for replacement (résumé PDF, LinkedIn URL, bio/experience). `base_url` and worker URL are filled in during Task 17. No `TODO`/unspecified-code steps remain.

**Type consistency:** Component prop names (`href`, `title`, `summary`, `tools`, `date`), collection field names (`posts`/`projects` schemas), and `post.id`/`project.id` routing are consistent across Tasks 7–15. `readingTime` signature matches its test.

**Distinctive signature:** intentionally deferred per spec §7/§12 (a focused `frontend-design` pass post-v1); not a gap.

---

## Out of scope for this plan (future)
Distinctive-signature design pass; Cloudflare Web Analytics; comments; contact form backend; newsletter. Each is a separate, small follow-up plan.
