# Home Redesign ("Orbit" Cover) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page with a dark "Orbit" cover — a centered Cormorant identity (name + blurb + nav) wrapped by a slow, motion-safe orbiting ring of curated "Highlights" cards — and shift the site to a dark default with a Cormorant + Inter type system.

**Architecture:** Progressive enhancement. The home page renders the hero + Highlights cards as static, crawlable HTML (a calm gallery — what mobile, no-JS, and reduced-motion users get). A small home-only client script *enhances* that into the rotating orbit on desktops that allow motion. A new `highlights` content collection (CMS-managed) feeds the cards. Theme default flips to dark; light remains a toggle.

**Tech Stack:** Astro 7, Cormorant Garamond + Inter (Fontsource or Google Fonts), existing Vitest + Playwright. No new runtime dependencies.

**Reference spec:** `docs/superpowers/specs/2026-06-26-home-redesign-design.md`

**Key tokens (dark default):** bg `#0F0E0C`, ink `#EFEBE3`, muted `#8C867B`, hairline `#2A2620`, accent (inner pages only) `#8FB0E0`. Display font Cormorant Garamond; text font Inter.

**Conventions:** Each task ends in a commit (Conventional Commits). On Windows, never run a foreground blocking dev server — verify with `npm run build`, `npm run test:e2e`, `npm run test:unit`, `npm run check`. Work on branch `feat/home-redesign`.

---

## File Structure

```
src/
├─ styles/global.css            # MODIFY: fonts → Cormorant+Inter, dark-default tokens, heading rules
├─ content.config.ts            # MODIFY: add `highlights` collection
├─ layouts/BaseLayout.astro     # MODIFY: dark default + theme bootstrap; `cover` prop hides header, shows corner toggle
├─ components/
│  ├─ Orbit.astro               # CREATE: highlights cards + progressive-enhancement orbit script
│  └─ ThemeToggle.astro         # (reused; rendered in corner on cover)
├─ pages/index.astro            # REWRITE: cover = hero + Orbit
└─ content/highlights/*.md      # CREATE: placeholder highlights
public/
├─ uploads/highlights/*.svg     # CREATE: placeholder images (committed, no external deps)
└─ admin/config.yml             # MODIFY: add Highlights collection
tests/e2e/
├─ smoke.spec.ts                # MODIFY: new home assertions (name, nav, orbit cards)
├─ theme.spec.ts                # MODIFY: dark default
├─ nav.spec.ts                  # MODIFY: home hero nav
├─ a11y.spec.ts                 # MODIFY: toggle lives in cover corner on home
└─ orbit.spec.ts               # CREATE: orbit renders + reduced-motion static
```

---

## Task 1: Highlights collection + placeholder images + CMS

**Files:**
- Modify: `src/content.config.ts`
- Create: `public/uploads/highlights/h1.svg … h6.svg`
- Create: `src/content/highlights/01-phishing-range.md … 06-secrets-scanner.md`
- Modify: `public/admin/config.yml`

- [ ] **Step 1: Add the `highlights` collection**

In `src/content.config.ts`, add this collection definition (alongside the existing `posts` and `projects`):
```ts
const highlights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/highlights' }),
  schema: z.object({
    image: z.string(),
    caption: z.string(),
    link: z.string().optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});
```
And update the export to:
```ts
export const collections = { posts, projects, highlights };
```

- [ ] **Step 2: Generate six committed placeholder images (no external deps)**

Run this to create six simple, tasteful duotone SVG placeholders:
```bash
mkdir -p public/uploads/highlights
i=1
for hue in "#1f3a5f|#9bb8da" "#3a2f5f|#b9a8da" "#1f5f4f|#9bdac4" "#5f3a2f|#dab39b" "#3f3f46|#c9c9d2" "#5f1f3a|#da9bb8"; do
  bg="${hue%%|*}"; fg="${hue##*|}"
  cat > "public/uploads/highlights/h$i.svg" <<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 440">
  <rect width="360" height="440" fill="$bg"/>
  <circle cx="250" cy="150" r="150" fill="$fg" opacity="0.30"/>
  <circle cx="120" cy="330" r="110" fill="$fg" opacity="0.18"/>
</svg>
SVG
  i=$((i+1))
done
ls public/uploads/highlights
```
Expected: `h1.svg`…`h6.svg` created.

- [ ] **Step 3: Add six placeholder highlights**

Create `src/content/highlights/01-phishing-range.md`:
```md
---
image: /uploads/highlights/h1.svg
caption: Internal phishing range
link: /projects/internal-phishing-range/
order: 1
---
```
Create `src/content/highlights/02-home-lab.md`:
```md
---
image: /uploads/highlights/h2.svg
caption: Home lab
order: 2
---
```
Create `src/content/highlights/03-defcon.md`:
```md
---
image: /uploads/highlights/h3.svg
caption: DEF CON
order: 3
---
```
Create `src/content/highlights/04-trail-running.md`:
```md
---
image: /uploads/highlights/h4.svg
caption: Trail running
order: 4
---
```
Create `src/content/highlights/05-reading.md`:
```md
---
image: /uploads/highlights/h5.svg
caption: Currently reading
order: 5
---
```
Create `src/content/highlights/06-secrets-scanner.md`:
```md
---
image: /uploads/highlights/h6.svg
caption: Pre-commit secrets scanner
link: /projects/secrets-scanner/
order: 6
---
```

- [ ] **Step 4: Add the Highlights collection to the CMS**

In `public/admin/config.yml`, add this collection under `collections:` (same indentation as `posts`/`projects`):
```yaml
  - name: "highlights"
    label: "Highlights (home orbit)"
    folder: "src/content/highlights"
    create: true
    slug: "{{order}}-{{slug}}"
    extension: "md"
    format: "frontmatter"
    fields:
      - { name: "image", label: "Image", widget: "image" }
      - { name: "caption", label: "Caption", widget: "string" }
      - { name: "link", label: "Link (optional)", widget: "string", required: false, hint: "/projects/... or https://..." }
      - { name: "order", label: "Order", widget: "number", default: 0, value_type: "int" }
      - { name: "draft", label: "Draft", widget: "boolean", default: false }
```

- [ ] **Step 5: Verify + commit**

Run: `npm run check`
Expected: 0 errors (the new collection + 6 entries validate).
```bash
git add -A
git commit -m "feat: add highlights collection, placeholder images, and CMS config"
```

---

## Task 2: Type system + dark default

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`
- Test: `tests/e2e/theme.spec.ts`

- [ ] **Step 1: Update the failing theme test to expect a dark default**

Replace `tests/e2e/theme.spec.ts` with:
```ts
import { test, expect } from '@playwright/test';

test('theme defaults to dark and toggle persists', async ({ page }) => {
  await page.goto('/about/');           // inner page always shows the header toggle
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.getByRole('button', { name: /toggle theme/i }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'light');
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:e2e -- theme`
Expected: FAIL (current default is light).

- [ ] **Step 3: Swap fonts + dark-default tokens in global.css**

In `src/styles/global.css`, replace the font `@import` lines at the top with:
```css
@import '@fontsource-variable/inter';
@import '@fontsource/cormorant-garamond/500.css';
@import '@fontsource/cormorant-garamond/600.css';
```
> Install the new font package first: `npm install @fontsource/cormorant-garamond` (keep `@fontsource-variable/inter`; you may remove `@fontsource-variable/fraunces` from package.json since it's no longer imported).

Replace the `:root` and `[data-theme='dark']` blocks with:
```css
:root {
  /* light theme (toggle) */
  --paper: #FAF9F7; --ink: #1A1A1A; --muted: #6F6A63; --hairline: #E6E2DC;
  --accent: #23406E; --accent-contrast: #FFFFFF; --code-bg: #F4F2EE;

  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter Variable', system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, Menlo, Consolas, monospace;

  --space-1:.25rem; --space-2:.5rem; --space-3:1rem; --space-4:1.5rem; --space-5:2.5rem; --space-6:4rem;
  --maxw-prose:38rem; --maxw-page:64rem; --radius:12px;
}
[data-theme='dark'] {
  --paper: #0F0E0C; --ink: #EFEBE3; --muted: #8C867B; --hairline: #2A2620;
  --accent: #8FB0E0; --accent-contrast: #0F0E0C; --code-bg: #1B1813;
}
```

Replace the heading rules with (Cormorant for display `h1`, Inter for the rest):
```css
body { font-family: var(--font-sans); }
h1 { font-family: var(--font-display); font-weight: 600; line-height: 1.04; letter-spacing: 0; font-size: clamp(2.4rem, 6vw, 3.6rem); }
h2, h3, h4 { font-family: var(--font-sans); font-weight: 600; line-height: 1.2; letter-spacing: -0.01em; }
h2 { font-size: clamp(1.4rem, 3vw, 1.9rem); }
.prose h2 { font-family: var(--font-sans); }
```
> Leave the rest of `global.css` (spacing, prose, focus, etc.) intact. Any remaining `var(--font-serif)` references must be changed to `var(--font-display)`.

- [ ] **Step 4: Flip the default theme to dark in BaseLayout**

In `src/layouts/BaseLayout.astro`:
- Change the `<html>` tag default: `<html lang="en" data-theme="dark">`.
- Replace the inline theme bootstrap script with:
```html
<script is:inline>
  (() => {
    const saved = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', saved === 'light' ? 'light' : 'dark');
  })();
</script>
```

- [ ] **Step 5: Run tests + build**

Run: `npm run test:e2e -- theme` → PASS.
Run: `npm run check` → 0 errors. Run: `npm run build` → exit 0.

- [ ] **Step 6: Commit**
```bash
git add -A
git commit -m "feat: switch to Cormorant+Inter type system and dark default theme"
```

---

## Task 3: BaseLayout `cover` prop (hide header, corner toggle)

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/ThemeToggle.astro` (add an optional `corner` style hook)

- [ ] **Step 1: Add the `cover` prop to BaseLayout**

In `src/layouts/BaseLayout.astro`, extend the Props interface and destructure:
```ts
interface Props { title: string; description?: string; image?: string; type?: 'website' | 'article'; cover?: boolean; }
```
```ts
const { title, description = '...', image = '/favicon.svg', type = 'website', cover = false } = Astro.props;
```
> Keep the existing default `description` text.

Replace the `<body>` contents structure with:
```astro
<body>
  <a href="#main" class="visually-hidden">Skip to content</a>
  {cover ? <div class="cover-toggle"><ThemeToggle /></div> : <Header />}
  <main id="main">
    <slot />
  </main>
  {!cover && <Footer />}
</body>
```
Add `import ThemeToggle from '../components/ThemeToggle.astro';` to the frontmatter (Header/Footer already imported). Add this style block:
```astro
<style>
  .cover-toggle { position: fixed; top: 16px; right: 16px; z-index: 20; }
</style>
```

- [ ] **Step 2: Verify build**

Run: `npm run build` → exit 0 (no page uses `cover` yet; nothing breaks).

- [ ] **Step 3: Commit**
```bash
git add -A
git commit -m "feat: add cover layout mode (hidden header + corner theme toggle)"
```

---

## Task 4: Orbit component (progressive enhancement)

**Files:**
- Create: `src/components/Orbit.astro`

The component renders Highlights as a static, centered gallery by default (mobile / no-JS / reduced-motion). A script upgrades it to the rotating ring only when the viewport is ≥720px and motion is allowed.

- [ ] **Step 1: Create the component**

Create `src/components/Orbit.astro`:
```astro
---
interface Item { image: string; caption: string; link?: string; }
interface Props { items: Item[]; }
const { items } = Astro.props;
---
<div class="orbit" data-orbit>
  {items.map((it) => (
    <a class="orbit-card" href={it.link ?? '#'} aria-label={it.caption}>
      <img src={it.image} alt={it.caption} width="116" height="146" loading="lazy" />
      <span class="orbit-cap">{it.caption}</span>
    </a>
  ))}
</div>

<style>
  /* default = calm static gallery (mobile / no-JS / reduced-motion) */
  .orbit { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-3); max-width: 720px; margin: var(--space-5) auto 0; }
  .orbit-card { position: relative; width: 116px; height: 146px; border-radius: 10px; overflow: hidden;
    border: 1px solid rgba(255,255,255,.08); box-shadow: 0 14px 40px rgba(0,0,0,.45); }
  .orbit-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .orbit-cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 7px 9px; font-size: 11px;
    color: var(--ink); background: linear-gradient(transparent, rgba(0,0,0,.7)); opacity: 0; transition: opacity .3s; }
  .orbit-card:hover .orbit-cap, .orbit-card:focus-visible .orbit-cap { opacity: 1; }

  /* active = ring (set by script on capable viewports) */
  .orbit.is-ring { position: absolute; inset: 0; max-width: none; margin: 0; display: block; }
  .orbit.is-ring .orbit-card { position: absolute; left: 50%; top: 50%; margin: -73px 0 0 -58px; will-change: transform, opacity; }
</style>

<script>
  const mqDesktop = matchMedia('(min-width: 720px)');
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.querySelector('[data-orbit]') as HTMLElement | null;
  if (root) {
    const cards = Array.from(root.querySelectorAll('.orbit-card')) as HTMLElement[];
    const N = cards.length;
    let theta = 0, hover = -1, raf = 0, active = false;

    cards.forEach((c, i) => {
      c.addEventListener('mouseenter', () => (hover = i));
      c.addEventListener('mouseleave', () => (hover = -1));
      c.addEventListener('focus', () => (hover = i));
      c.addEventListener('blur', () => (hover = -1));
    });

    function frame() {
      const host = root!.parentElement as HTMLElement;
      const W = host.clientWidth, H = host.clientHeight, R = Math.min(W, H) * 0.56;
      if (hover < 0) theta += 0.00075 * 0.5; // slow
      for (let i = 0; i < N; i++) {
        const a = theta + i * (2 * Math.PI / N);
        const x = Math.cos(a) * R, y = Math.sin(a) * R * 0.62;
        const depth = (Math.sin(a) + 1) / 2;
        const sc = (0.7 + depth * 0.46) * (hover === i ? 1.3 : 1);
        cards[i].style.transform = `translate(${x}px,${y}px) scale(${sc})`;
        cards[i].style.zIndex = String(hover === i ? 160 : Math.round(depth * 100));
        cards[i].style.opacity = String(hover >= 0 && hover !== i ? 0.5 : 0.55 + depth * 0.45);
      }
      raf = requestAnimationFrame(frame);
    }

    function enable() {
      if (active) return; active = true; root!.classList.add('is-ring'); frame();
    }
    function disable() {
      if (!active) return; active = false; cancelAnimationFrame(raf);
      root!.classList.remove('is-ring');
      cards.forEach((c) => { c.style.transform = ''; c.style.zIndex = ''; c.style.opacity = ''; });
    }
    function evaluate() { (mqDesktop.matches && !mqReduce.matches) ? enable() : disable(); }

    evaluate();
    mqDesktop.addEventListener('change', evaluate);
    mqReduce.addEventListener('change', evaluate);
  }
</script>
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run check` → 0 errors. (The component isn't used yet; this just confirms it type-checks.)

- [ ] **Step 3: Commit**
```bash
git add -A
git commit -m "feat: add Orbit component (static gallery upgraded to ring on capable viewports)"
```

---

## Task 5: Home page rewrite + update tests

**Files:**
- Rewrite: `src/pages/index.astro`
- Modify: `tests/e2e/smoke.spec.ts`, `tests/e2e/nav.spec.ts`, `tests/e2e/a11y.spec.ts`
- Create: `tests/e2e/orbit.spec.ts`

- [ ] **Step 1: Update the home assertions (smoke)**

Replace `tests/e2e/smoke.spec.ts` with:
```ts
import { test, expect } from '@playwright/test';

test('home loads with the right title', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle(/Simon Kuester/);
});

test('home shows the centered identity', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Simon Kuester' })).toBeVisible();
  await expect(page.getByText(/secure systems/i)).toBeVisible();
});
```

- [ ] **Step 2: Update nav test for the home hero nav**

Replace `tests/e2e/nav.spec.ts` with:
```ts
import { test, expect } from '@playwright/test';
const links = ['About', 'Projects', 'Writing', 'Contact'];

test('home hero nav exposes all links', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  for (const name of links) {
    await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
  }
});

test('inner pages keep the header nav', async ({ page }) => {
  await page.goto('/about/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link', { name: 'Projects', exact: true })).toBeVisible();
});
```

- [ ] **Step 3: Update a11y test (toggle is in the cover corner on home)**

In `tests/e2e/a11y.spec.ts`, the existing checks for one `h1`, lang, and skip link stay. Replace the theme-toggle check so it doesn't assume the header:
```ts
test('theme toggle is reachable on home', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /toggle theme/i })).toBeVisible();
});
```
(The other a11y tests in this file are unchanged.)

- [ ] **Step 4: Add an orbit test**

Create `tests/e2e/orbit.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test('home renders highlight cards as links with images', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.orbit-card');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThanOrEqual(6);
  await expect(cards.first().locator('img')).toHaveAttribute('alt', /.+/);
});

test('reduced-motion keeps the orbit static (no ring class)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.orbit')).not.toHaveClass(/is-ring/);
});
```

- [ ] **Step 5: Run the updated tests to verify they fail**

Run: `npm run test:e2e -- smoke nav a11y orbit`
Expected: FAIL (home still has the old layout/sections).

- [ ] **Step 6: Rewrite the home page**

Replace `src/pages/index.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import Orbit from '../components/Orbit.astro';

const items = (await getCollection('highlights', ({ data }) => !data.draft))
  .sort((a, b) => a.data.order - b.data.order)
  .map((h) => ({ image: h.data.image, caption: h.data.caption, link: h.data.link }));
---
<BaseLayout title="Simon Kuester" cover>
  <section class="cover">
    <Orbit items={items} />
    <div class="hero">
      <h1>Simon Kuester</h1>
      <p class="blurb">I secure systems, break them on purpose, and write about what I learn.</p>
      <nav class="hero-nav" aria-label="Primary">
        <a href="/about/">About</a>
        <a href="/projects/">Projects</a>
        <a href="/writing/">Writing</a>
        <a href="/contact/">Contact</a>
      </nav>
    </div>
  </section>
</BaseLayout>

<style>
  .cover { position: relative; min-height: calc(100svh - 0px); display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 24px; overflow: hidden; }
  .hero { position: relative; z-index: 10; text-align: center; pointer-events: none; }
  .hero h1 { font-size: clamp(58px, 8.4vw, 112px); margin: 0; }
  .blurb { margin: 18px auto 0; max-width: 32ch; color: var(--ink); font-size: clamp(15px, 1.4vw, 17px); line-height: 1.7; }
  .hero-nav { display: flex; gap: 30px; justify-content: center; margin-top: 30px; pointer-events: auto; flex-wrap: wrap; }
  .hero-nav a { position: relative; color: var(--ink); text-decoration: none; font-size: 15px; font-weight: 500; }
  .hero-nav a::after { content: ""; position: absolute; left: 0; bottom: -4px; height: 1px; width: 100%; background: var(--ink); transform: scaleX(0); transform-origin: left; transition: transform .4s cubic-bezier(.2,.7,.2,1); }
  .hero-nav a:hover::after, .hero-nav a:focus-visible::after { transform: scaleX(1); }
  /* center veil so cards never fight the text */
  .cover::before { content: ""; position: absolute; inset: 0; z-index: 5; pointer-events: none;
    background: radial-gradient(34% 30% at 50% 50%, rgba(15,14,12,.85), transparent 70%); }
</style>
```
> Note: the static gallery (`.orbit` default) appears below the hero on mobile/no-JS because it's in normal flow; when the script adds `.is-ring`, the orbit becomes absolutely positioned and wraps the hero. The `.cover::before` veil keeps the centered text legible behind front cards.

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm run test:e2e -- smoke nav a11y orbit`
Expected: PASS. Then run the FULL `npm run test:e2e` and `npm run build` (exit 0).

- [ ] **Step 8: Commit**
```bash
git add -A
git commit -m "feat: rebuild home as the dark Orbit cover"
```

---

## Task 6: Inner-page polish for the new type + dark default

**Files:**
- Modify (verify/adjust): `src/pages/about.astro`, `src/pages/projects/index.astro`, `src/pages/projects/[...slug].astro`, `src/pages/writing/index.astro`, `src/pages/writing/[...slug].astro`, `src/pages/contact.astro`, `src/components/PostCard.astro`, `src/components/ProjectCard.astro`

- [ ] **Step 1: Find any leftover serif references**

Run: `npx rg "font-serif|Fraunces" src` (or `grep -rn`).
Expected: no remaining references. If any exist, change them to `var(--font-display)` (for large display text) or `var(--font-sans)` (for body/sub-headings). Card titles (`PostCard`/`ProjectCard` `h3`) should be `var(--font-sans)`.

- [ ] **Step 2: Build and visually verify in dark**

Run: `npm run build && npm run preview` is blocked (foreground) — instead build, then check the emitted HTML/CSS compiles: `npm run build` (exit 0) and `npm run check` (0 errors). Then run the responsive + a11y suites which load the inner pages: `npm run test:e2e -- responsive a11y` → PASS (confirms inner pages render with no horizontal overflow and one h1 each in the dark theme).

- [ ] **Step 3: Confirm contrast tokens**

Confirm dark tokens meet AA: ink `#EFEBE3` on bg `#0F0E0C` (≈ 15:1), muted `#8C867B` on bg (≈ 6:1), accent link `#8FB0E0` on bg (≈ 8:1). No change needed unless a specific element fails; if so, lighten the muted/accent token.

- [ ] **Step 4: Commit (if any changes)**
```bash
git add -A
git commit -m "refactor: align inner pages with Cormorant+Inter dark system"
```

---

## Task 7: Quality pass

**Files:** none (verification) — may add fixes if gates fail.

- [ ] **Step 1: Full suites**

Run: `npm run test:unit` (2 pass) and `npm run test:e2e` (all specs pass: smoke, nav, theme, feeds, a11y, responsive, orbit).

- [ ] **Step 2: Lighthouse on the new home**

Run:
```bash
npm run build && npm run preview &
npx lighthouse http://localhost:4321/ --quiet --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless"
```
Expected: all categories ≥ 0.95. Stop preview after. The orbit is a tiny script + lazy images, so perf should hold; if accessibility dips, check card `alt`/`aria-label` and contrast.

- [ ] **Step 3: Manual reduced-motion + mobile sanity**

Confirm with the orbit spec already covering reduced-motion. For mobile, the responsive spec confirms no overflow at 360px; the static gallery renders the cards in a centered wrap.

- [ ] **Step 4: Commit**
```bash
git add -A
git commit -m "test: verify home redesign meets perf/a11y/responsive gates"
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Centered name+blurb+nav, no labels, header hidden on home → Task 5 (+ Task 3 cover prop).
- Cormorant display + Inter, drop Fraunces → Task 2 (+ Task 6 cleanup).
- Dark default + light toggle, reconciled palette → Task 2.
- Orbit: slow, spaced, hover-pause, click-link, reduced-motion freeze → Task 4 (+ Task 5 wiring).
- Highlights = curated mix, CMS-managed → Task 1.
- Mobile static gallery → Task 4 (default CSS) verified Task 6/7.
- A11y (h1, nav label, alt, focus, skip link, toggle reachable) → Tasks 3/5/7.
- Perf/SEO (static HTML cards, lazy images, tiny script, Lighthouse ≥95) → Tasks 4/5/7.

**Placeholder scan:** Real code in every step. Placeholder *content* (SVG images, sample highlights, blurb) is intentional per spec §7 and swappable via CMS. No `TODO`/unspecified steps.

**Type consistency:** `highlights` schema fields (`image`/`caption`/`link`/`order`/`draft`) match the CMS config (Task 1) and the `Orbit` `Item` interface + `index.astro` mapping (Tasks 4–5). `--font-display`/`--font-sans` names consistent across Tasks 2 and 6. `cover` prop consistent across Tasks 3 and 5. `.orbit`/`.orbit-card`/`.is-ring` class names consistent across Tasks 4–5 and the tests.

---

## Out of scope (future)
Real Highlights imagery (Simon adds via CMS); per-card detail/lightbox on click; an optional one-time hero entrance animation; revisiting the light theme's polish under the new type.
