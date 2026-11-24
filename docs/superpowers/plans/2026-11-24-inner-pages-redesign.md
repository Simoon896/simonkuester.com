# Inner Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every inner page (About, a new combined Work page, Contact, project and post pages, 404) in the approved A2 design, and retire the old Projects/Writing list pages.

**Architecture:** A small section map (`src/lib/sections.ts`) decides each page's section, colour and accent from its path. `BaseLayout` reads it, sets `data-section` on `<body>` for the colour tokens, renders the new header and, unless told not to, the onward row. Shared layout classes (statement, rail, columns, serif headings) live in `global.css` so every page composes the same parts. The throwaway mockups in `src/pages/mock/` are the visual reference until the last task deletes them.

**Tech Stack:** Astro 7 (static), TypeScript strict, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-24-inner-pages-redesign-design.md`

## Global Constraints

- Sections are About, Work, Contact. `/work/` is new; `/projects/<slug>/` and `/writing/<slug>/` keep their URLs; `/projects/` and `/writing/` redirect to `/work/`.
- Job title everywhere on the site: "Cybersecurity Engineering Associate".
- Section colours (gradient / dark accent / light accent): About `#caa0ff→#8f47ff` / `#caa0ff` / `#6b34d6`; Work `#ffce6a→#ff7a30` / `#ffb26b` / `#a8480a`; Contact `#ff90c5→#ff3d9c` / `#ff90c5` / `#c2186f`; 404 `#86b6ff→#3f72ff` / `#86b6ff` / `#2f55d4`. Accents used as text must reach 4.5:1 on `--paper` in their theme.
- Home cover keeps terracotta and its design; only its nav links change.
- No new runtime dependencies. The copy button is the only new client JS; set up on `astro:page-load`.
- No motion that runs by itself; `prefers-reduced-motion` honoured.
- Copy: contractions, no em-dashes in new prose, "resume" not "résumé".
- Exactly one `h1` per page. About, Work, Contact: visually hidden section name. Post, project: the visible title.
- No horizontal scroll at 360, 768, 1280px.
- `package-lock.json` stays uncommitted; stage files by name. Nothing is committed or pushed until Simon reviews the built result.

## Review Focus

- A post or project with no `coverImage` (the first post): no hero, no empty picture column, no gap where it would be. Test in Task 4.
- Navigating between sections with View Transitions (no full reload): the header marker, section colour and copy button must all follow. Test in Task 5.
- Old bookmarks and shared links: `/projects/`, `/writing/` and every existing detail URL still lead somewhere real. Test in Task 3.
- Light theme: every section accent stays readable as link text. Test in Task 1.
- A phone at 360px on Contact: the email address wraps instead of pushing the page sideways. Covered by the responsive test in Task 6.

---

### Task 1: Section map, header, onward row, shared layout

**Files:**
- Create: `src/lib/sections.ts`, `src/lib/sections.test.ts`, `src/components/Onward.astro`
- Modify: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/ThemeToggle.astro`, `src/styles/global.css`, `src/pages/index.astro` (nav links only)
- Delete: `src/components/PaintSplotches.astro`
- Test: `tests/e2e/decor.spec.ts`, `tests/e2e/nav.spec.ts`

**Interfaces:**
- Produces:
  - `type SectionId = 'about' | 'work' | 'contact'`
  - `interface Section { id: SectionId; label: string; href: string; gradient: string; accentDark: string; accentLight: string }`
  - `SECTIONS: Section[]` in nav order, hrefs `/about/`, `/work/`, `/contact/`
  - `sectionForPath(pathname: string): SectionId | null` — `/about…` → about; `/work…`, `/projects…`, `/writing…` → work; `/contact…` → contact; anything else (including `/`, `/404`) → null
  - `contrastRatio(hexA: string, hexB: string): number` (WCAG relative luminance)
  - `BaseLayout` props added: `onward?: boolean` (default true), `fill?: boolean` (default false). `<body data-section={id ?? 'none'}>`; `fill` adds `data-fill` to `<body>`.
  - `Onward.astro` props: `current: SectionId | null`; renders the other sections (all three when null) as `<nav class="onward" aria-label="Other sections">` inside its own `.page` wrapper, serif `clamp(1.8rem, 4.2vw, 3rem)`, each label followed by a `.dot` in that section's gradient, `margin-top: clamp(3.5rem, 8vw, 6rem)`, no rule above it.
  - Global classes: `.page` (64rem width, `--space-3` side padding), `.statement`, `.cols`, `.rail` (with `dl`/`dt`/`dd`), `.serif-h2`, `.btn`, `.dot` (small section ball, uses `--g`).

- [ ] **Step 1: Write failing unit tests in `src/lib/sections.test.ts`**

```ts
expect(sectionForPath('/about/')).toBe('about');
expect(sectionForPath('/work/')).toBe('work');
expect(sectionForPath('/projects/ai-detection-engineering-platform/')).toBe('work');
expect(sectionForPath('/writing/building-this-site/')).toBe('work');
expect(sectionForPath('/contact/')).toBe('contact');
expect(sectionForPath('/')).toBeNull();
expect(sectionForPath('/404')).toBeNull();
expect(SECTIONS.map((s) => s.label)).toEqual(['About', 'Work', 'Contact']);
// readable accents in both themes (paper colours from global.css)
for (const s of SECTIONS) {
  expect(contrastRatio(s.accentDark, '#0F0E0C')).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(s.accentLight, '#FAF9F7')).toBeGreaterThanOrEqual(4.5);
}
```

- [ ] **Step 2: Run `npm run test:unit` — expect FAIL (module not found).**

- [ ] **Step 3: Implement `src/lib/sections.ts`** with the exact colours from Global Constraints. If a light accent fails 4.5:1, darken it until it passes and note the new value in the spec.

- [ ] **Step 4: Run `npm run test:unit` — expect PASS.**

- [ ] **Step 5: Update e2e tests first.** In `nav.spec.ts`, links become `['About', 'Work', 'Contact']`; add: on `/work/` the Primary nav's Work link has `aria-current="page"`, and on `/writing/building-this-site/` it does too. In `decor.spec.ts`, keep the two blob-field tests, replace the two splotch tests with: `/about/` has no `.splotches` element; `/about/` has a `.statement` and a `nav[aria-label="Other sections"]`.

- [ ] **Step 6: Build the shell.**
  - `global.css`: add the shared classes (sizes from the spec: statement `clamp(1.9rem, 3.8vw, 2.9rem)`, line height 1.15, max 22em, margins `clamp(1.75rem,4vw,3rem)` top / `clamp(2rem,4.5vw,3.25rem)` bottom; rail 15rem, gap 4.5rem, text max 38rem, stack below 900px; serif h2 2rem/600) and the section tokens: `body[data-section='about'] { --g: …; --accent: …; --accent-contrast: #0F0E0C }`, light overrides under `[data-theme='light'] body[data-section=…]` with `--accent-contrast: #FFFFFF`, plus `none` (404 blue). Fill mode: `body[data-fill]` is a full-height flex column, `main` grows, footer `margin-top: 0; width: 100%`. Drop the `body > header…z-index` rule.
  - `Header.astro`: items from `SECTIONS`; `aria-current="page"` when `sectionForPath(path) === id`; the current link is ink + weight 500 followed by a 0.44em dot in its own gradient (set `--g` inline per link). No bottom border. Stays on one line at 360px (tighten gaps under 420px, `flex-wrap: nowrap`).
  - `BaseLayout.astro`: compute the section, set body attributes, remove `PaintSplotches`, render `<Onward current={section} />` after `<main>`'s slot when `onward && !cover`. Wrap nothing else; pages use `.page` themselves.
  - `Footer.astro`: `const year = new Date().getFullYear();`
  - `ThemeToggle.astro`: replace the ☀/☾ glyphs with inline 18px SVG sun and moon icons (`aria-hidden`, `stroke="currentColor"`), same show/hide logic.
  - `index.astro`: hero nav links become About `/about/`, Work `/work/`, Contact `/contact/`.
  - Delete `PaintSplotches.astro`.

- [ ] **Step 7: Run `npm run build && npm run test:e2e -- nav decor` — expect PASS** (pages still render with old bodies; that's fine).

### Task 2: About page

**Files:**
- Modify: `src/pages/about.astro`
- Test: `tests/e2e/pages.spec.ts` (create)

**Interfaces:**
- Consumes: global classes and BaseLayout from Task 1.

- [ ] **Step 1: Create `tests/e2e/pages.spec.ts` with the About test (fails now):**

```ts
test('about leads with the story and a fact rail', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('.statement')).toContainText('phished my Minecraft');
  const rail = page.locator('.rail');
  await expect(rail).toContainText('Cybersecurity Engineering Associate');
  await expect(rail.getByRole('link', { name: 'Download resume (PDF)' })).toHaveAttribute('href', '/resume.pdf');
  await expect(page.getByText('Focus areas')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About');
});
```

- [ ] **Step 2: Run `npm run test:e2e -- pages` — expect FAIL.**
- [ ] **Step 3: Rewrite `about.astro`** to match `src/pages/mock/a2.astro` + `_AboutBody.astro`: hidden `h1` "About", `.statement` with the Minecraft story (with its full stop), `.cols` with the rail (Role, Company, Education "B.S. in Cybersecurity, University of North Georgia (2025, 3.84 GPA)", Certifications list, resume `.btn`) and the text column (two "now" paragraphs, serif "Experience" with job titles as serif h3 and a muted "Genix Cyber, <period>" line, serif "Outside work"). Use the new job title in the Experience entry, the first paragraph ("I'm a cybersecurity engineering associate at Genix Cyber, …") and the page description. Remove Focus.
- [ ] **Step 4: Run `npm run test:e2e -- pages` — expect PASS.**

### Task 3: Work page, redirects, retired list pages

**Files:**
- Create: `src/pages/work.astro`, `src/utils/image-size.ts`, `src/utils/image-size.test.ts`
- Modify: `astro.config.mjs`
- Delete: `src/pages/projects/index.astro`, `src/pages/writing/index.astro`, `src/components/ProjectCard.astro`, `src/components/PostCard.astro`
- Test: `tests/e2e/pages.spec.ts`, `tests/e2e/a11y.spec.ts`, `tests/e2e/responsive.spec.ts`

**Interfaces:**
- Produces: `publicImageSize(src: string): { width: number; height: number } | null` — `src` is a site path like `/uploads/x.png`; reads `public/<src>` and parses the PNG IHDR or the first JPEG SOF0/SOF2 marker; returns null for a missing file or another format. `isLogoShaped(size): boolean` — true when width / height > 2.2.

- [ ] **Step 1: Write failing unit tests** in `image-size.test.ts`: `/uploads/project-1.png` → `{ width: 905, height: 771 }`; `/uploads/strongdm logo.png` → `{ width: 804, height: 217 }`; `/uploads/identity-week-2026/argus-booth.jpg` → `{ width: 1600, height: 1200 }`; `/uploads/missing.png` → null; `isLogoShaped({width:804,height:217})` true, `isLogoShaped({width:905,height:771})` false.
- [ ] **Step 2: Run `npm run test:unit` — expect FAIL.**
- [ ] **Step 3: Implement `image-size.ts`** with `node:fs` and `node:path` (build-time only).
- [ ] **Step 4: Run `npm run test:unit` — expect PASS.**
- [ ] **Step 5: Add e2e tests to `pages.spec.ts` (fail now):**

```ts
test('work lists projects then writing as open rows', async ({ page }) => {
  await page.goto('/work/');
  const groups = page.locator('h2');
  await expect(groups.nth(0)).toHaveText('Projects');
  await expect(groups.nth(1)).toHaveText('Writing');
  await expect(page.getByRole('link', { name: 'AI-Driven Detection Engineering Platform' })).toHaveAttribute('href', '/projects/ai-detection-engineering-platform/');
  await expect(page.getByRole('link', { name: 'Demoing Argus at Identity Week America' })).toHaveAttribute('href', '/writing/identity-week-america-2026/');
});
for (const old of ['/projects/', '/writing/']) {
  test(`${old} lands on /work/`, async ({ page }) => {
    await page.goto(old);
    await page.waitForURL('**/work/');
  });
}
test('existing detail URLs still resolve', async ({ request }) => {
  for (const p of ['/projects/ai-detection-engineering-platform/', '/projects/strongdm-argus-integration/', '/writing/building-this-site/', '/writing/identity-week-america-2026/']) {
    expect((await request.get(p)).status()).toBe(200);
  }
});
```

  In `a11y.spec.ts` and `responsive.spec.ts`, the path lists become `['/', '/about/', '/work/', '/contact/']`.
- [ ] **Step 6: Run `npm run test:e2e -- pages` — expect FAIL.**
- [ ] **Step 7: Build `work.astro`** from `src/pages/mock/work.astro` (real hrefs, no mock link helpers): hidden `h1` "Work", statement "Projects I've built and posts I've written. I keep adding to this page as I make new things.", serif group headings "Projects" then "Writing", rows `9rem | 1fr | 19rem` with 3rem gap and 1.75rem vertical padding, no borders. Projects sorted by `order` then title; posts newest first, drafts excluded. Thumbnail: `width`/`height` from `publicImageSize`; logo-shaped covers centred on a `#FAF9F7` panel with `object-fit: contain`. On phones the picture comes first. Add `redirects: { '/projects': '/work/', '/writing': '/work/' }` to `astro.config.mjs`. Delete the two old index pages and the two card components.
- [ ] **Step 8: Run `npm run build && npm run test:e2e -- pages a11y responsive` — expect PASS.**

### Task 4: Post and project pages

**Files:**
- Modify: `src/pages/writing/[...slug].astro`, `src/pages/projects/[...slug].astro`, `src/content.config.ts` (posts: `coverAlt: z.string().optional()`), `public/admin/config.yml` (posts: `{ name: "coverAlt", label: "Cover image description", widget: "string", required: false }` after `coverImage`), `src/content/posts/identity-week-america-2026.md`
- Delete: `src/components/Tag.astro`
- Test: `tests/e2e/pages.spec.ts`

**Interfaces:**
- Consumes: `publicImageSize`, `isLogoShaped` (Task 3); rail classes (Task 1).

- [ ] **Step 1: Add e2e tests (fail now):**

```ts
test('post with a cover leads with title, full-width photo and a rail', async ({ page }) => {
  await page.goto('/writing/identity-week-america-2026/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Demoing Argus at Identity Week America');
  const hero = page.locator('img.hero');
  await expect(hero).toHaveAttribute('alt', /booth/i);
  await expect(hero).toHaveAttribute('width', '1600');
  await expect(page.locator('.rail')).toContainText('Sep 6, 2026');
  await expect(page.locator('.prose img[src$="argus-booth.jpg"]')).toHaveCount(0); // cover not repeated
});
test('post without a cover has no hero', async ({ page }) => {
  await page.goto('/writing/building-this-site/');
  await expect(page.locator('img.hero')).toHaveCount(0);
  await expect(page.locator('.rail')).toContainText('Jun 27, 2026');
});
test('project page has a rail with tools and links', async ({ page }) => {
  await page.goto('/projects/ai-detection-engineering-platform/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('AI-Driven Detection Engineering Platform');
  await expect(page.locator('.rail')).toContainText('Atomic Red Team');
  await expect(page.locator('.rail').getByRole('link', { name: 'Repo' })).toBeVisible();
});
```

- [ ] **Step 2: Run `npm run test:e2e -- pages` — expect FAIL.**
- [ ] **Step 3: Rewrite the post page** from `src/pages/mock/post.astro`: `h1.statement` (max 18em), `img.hero` when `coverImage` (full page width, `aspect-ratio: 2 / 1`, `object-fit: cover`, `object-position: center 58%`, alt from `coverAlt` falling back to the title, `width`/`height` from `publicImageSize`), then `.cols` with the rail (Posted, Reading time, Topics, "All work" → `/work/`) and `.prose` body. Prose rules: serif h2 at 2rem, images rounded and at ≥1040px `width: calc(100% + 6.5rem)`, blockquotes as serif pull quotes (`clamp(1.5rem, 2.4vw, 1.9rem)`, 2px accent left rule, ink colour, not italic). Put these `.prose` rules in `global.css`, replacing the old ones.
- [ ] **Step 4: Rewrite the project page** from `src/pages/mock/project.astro`: `h1.statement` (max 16em), rail (When, Built with, Links, "All work"), serif lead summary, cover with real `width`/`height` (logo-shaped: natural size on the light panel; otherwise breakout like post images), then `.prose`.
- [ ] **Step 5: Content:** add `coverAlt: "The Genix Cyber booth at Identity Week America, with Argus banners and a demo screen behind the table"` to the Identity Week post and delete the first inline booth image line from its body. Add `coverAlt` to schema and CMS config. Delete `Tag.astro`.
- [ ] **Step 6: Run `npm run build && npm run check && npm run test:e2e -- pages` — expect PASS.**

### Task 5: Contact and 404

**Files:**
- Modify: `src/pages/contact.astro`, `src/pages/404.astro`
- Test: `tests/e2e/pages.spec.ts`

- [ ] **Step 1: Add e2e tests (fail now):**

```ts
test('contact is one screen with no onward row', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/contact/');
  await expect(page.getByRole('link', { name: 'simonkuester@gmail.com' })).toHaveAttribute('href', 'mailto:simonkuester@gmail.com');
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
});
test('404 offers all three sections', async ({ page }) => {
  await page.goto('/no-such-page/');
  await expect(page.locator('.statement')).toHaveText("That page doesn't exist.");
  await expect(page.locator('nav[aria-label="Other sections"] a')).toHaveCount(3);
});
```

- [ ] **Step 2: Run `npm run test:e2e -- pages` — expect FAIL.**
- [ ] **Step 3: Rewrite `contact.astro`** from `src/pages/mock/contact.astro` with `<BaseLayout onward={false} fill>`: hidden `h1` "Contact", content block with `margin-block: auto`, statement "Want to talk about something? Shoot me an email and I'll get back to you." at `clamp(1.5rem, 2.6vw, 2rem)` in ink, the email link at `clamp(1.75rem, 8.2vw, 6rem)` with `overflow-wrap: anywhere`, "Copy email" `.btn` with a `role="status"` span that says "Copied" (or "Could not copy. Select the address above instead.") and clears after 2.5s, then the GitHub / LinkedIn / Resume row (three columns, one below 760px). Copy script binds on `astro:page-load`, guarded so it binds once per button.
- [ ] **Step 4: Rewrite `404.astro`:** `.page`, hidden `h1` "Not found", `.statement` "That page doesn't exist." (Onward renders all three via BaseLayout because the section is null.)
- [ ] **Step 5: Run `npm run build && npm run test:e2e -- pages` — expect PASS.**

### Task 6: Share image, cleanup, full verification

**Files:**
- Create: `public/og.png` (1200×630)
- Modify: `src/layouts/BaseLayout.astro` (default `image = '/og.png'`), `CLAUDE.md`
- Delete: `src/pages/mock/` (whole folder)
- Test: `tests/e2e/feeds.spec.ts`

- [ ] **Step 1: Add a test to `feeds.spec.ts` (fails now):** `/` has `meta[property="og:image"]` content `https://simonkuester.com/og.png`, and `GET /og.png` returns 200 with `content-type` `image/png`.
- [ ] **Step 2: Generate `public/og.png`:** a one-off script in the scratchpad renders an HTML card at 1200×630 with Playwright's Chromium (dark `#0F0E0C` background, "Simon Kuester" in Cormorant Garamond 600 and "Cybersecurity Engineering Associate @ Genix Cyber" in Inter, loaded from `node_modules/@fontsource*` woff2 files, and four or five of the cover's gradient balls around the edges, not behind the text). Only the PNG goes into the repo. Check it by eye.
- [ ] **Step 3: Set the default image in `BaseLayout.astro`; delete `src/pages/mock/`; update `CLAUDE.md`** (layout section: sections map, Work page, redirects, removed splotches/cards/tags, OG image done; checklist item ticked).
- [ ] **Step 4: Full verification:** `npm run build` (no `/mock/` routes in the output), `npm run check` (0 errors), `npm run test:unit`, `npm run test:e2e` — all PASS. Then look at every inner page in the browser in dark and light at 375, 768 and 1440px wide, and click through About → Work → a post → a project → Contact without reloads.
