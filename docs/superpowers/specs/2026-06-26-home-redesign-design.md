# Home Redesign — "Orbit" Cover — Design Spec

- **Date:** 2026-06-26
- **Owner:** Simon Kuester
- **Status:** Approved design (pending spec review) — supersedes the original home page (Task 9) and shifts the site to a dark default
- **Related:** `2026-06-26-personal-website-design.md` (original build)

---

## 1. Overview

Replace the original home page with a **dark, cinematic "cover"**: a calm centered identity (name + one-line blurb + nav) wrapped by a **slowly orbiting ring of image cards** ("Highlights") that mix standout work with personal interests. The orbit supplies all the color and life; the center stays quiet. The whole site shifts to a **dark default** (light remains a toggle) for one cohesive, premium feel.

**Goal:** a distinctive, memorable, aesthetically-driven first impression that is unmistakably Simon's — not a template, not "AI gradient," not corny-cyber — while staying fast, accessible, and comfortable for motion-sensitive visitors.

---

## 2. Locked design decisions

**Layout (home):** full-screen hero. Centered, in order: name, blurb, nav (About · Projects · Writing · Contact). No labels/kickers, no "EST. 2026". The standard site header is **hidden on the home page** (the hero carries its own nav); it appears on all inner pages.

**Typography (site-wide):**
- Display (home name, page `h1` titles): **Cormorant Garamond**, ~600 weight. Both words of the name share one style (no italic split).
- Everything else (blurb, nav, body, sub-headings, UI): **Inter**.
- This replaces Fraunces. Two-font system: high-contrast display serif for big moments, clean grotesque for reading.

**Color (dark default):**
- Background `#0F0E0C` (warm near-black), text `#EFEBE3`, muted `#8C867B`, hairline `#2A2620`.
- Home hero uses **no accent** — color comes from the images.
- Inner pages use a restrained accent `#8FB0E0` (soft blue) for links/interactive only.
- Light theme retained via the existing toggle; light tokens stay as built. Default flips to **dark**.

**The orbit:**
- A ring of Highlights cards rotating slowly around the center on an elliptical path (gentle perspective: front cards larger/brighter, back cards smaller/dimmer).
- **Speed:** slow ("Slower" tuning). Generous radius so cards never overlap the centered text/nav.
- **Interactions:** hover → pause rotation + enlarge that card + reveal its caption; click → follow the card's link (if any). 
- **Motion safety (hard requirement):** smooth, slow, predictable circular motion only — no parallax, no jitter. `prefers-reduced-motion` → orbit is **frozen** into a static, evenly-spaced arrangement (no rotation). Pause-on-hover always available.

**Orbit content — "Highlights":** a curated mix of standout projects (link → case study) and personal interests (a hike, home lab, a talk, a book — link optional). Managed by Simon in the CMS.

---

## 3. Architecture & components

| Piece | File(s) | Responsibility |
|---|---|---|
| Highlights collection | `src/content.config.ts` (+ `src/content/highlights/*.md`) | New collection: each entry = image + caption + optional link + order. |
| Home page | `src/pages/index.astro` (rewrite) | Renders the hero (name/blurb/nav in static HTML for SEO) + the orbit container seeded with Highlights data; hides the global header. |
| Orbit script | `src/components/Orbit.astro` (scoped script) or `src/scripts/orbit.ts` | Client-side rotation/positioning, hover-pause, reduced-motion freeze, resize handling. Small, dependency-free, runs only on the home page. |
| Layout/header | `src/layouts/BaseLayout.astro`, `src/components/Header.astro` | Support a `hideHeader`/`cover` prop so the home page omits the standard header. |
| Theme | `src/layouts/BaseLayout.astro`, `src/styles/global.css` | Default `data-theme` flips to dark; reconcile dark tokens to the new palette; keep light toggle + no-FOUC bootstrap. |
| Type | `src/styles/global.css` | Swap font imports to Cormorant + Inter; update `--font-*` tokens and heading rules. |

### Highlights schema (CMS)
- `image` (string path, required)
- `caption` (string, required)
- `link` (string URL/path, optional)
- `order` (number, default 0)
- `draft` (boolean, default false)

CMS: add a **Highlights** collection to `public/admin/config.yml` (image, caption, link, order, draft) so Simon curates the orbit visually. Images upload to `public/uploads/`.

### Data flow
Home page `getCollection('highlights')` → sorts by `order`, filters drafts → serializes minimal data (image, caption, link) into the orbit container → client script lays them on the ring and animates. Images use native lazy-loading and fixed dimensions.

---

## 4. Responsive & accessibility

- **Mobile (hard requirement — site is mobile-first):** a spinning ring doesn't work on a phone. Below a breakpoint (~720px), the orbit becomes a **calm, static gallery** — an evenly-spaced grid of the Highlights below the centered name/blurb/nav, no rotation — beautiful and performant.
- **Reduced motion:** frozen static ring (desktop) / static gallery (mobile).
- **Accessibility:** hero name is a real `<h1>`; nav is a labelled `<nav>`; each card is a real link with descriptive alt text + caption; keyboard-focusable with visible focus; the orbit is decorative motion layered over accessible content (the page is fully usable with the orbit paused/frozen). Maintain WCAG AA contrast on the dark theme.
- **Performance/SEO:** name + blurb + nav + Highlights links render in static HTML (crawlable). Orbit script is tiny and home-only. Keep Lighthouse ≥ 95 across the board; images sized/lazy-loaded; fonts subset/`display=swap`.

---

## 5. Non-goals (v1 of the redesign)

- No 3D/WebGL, no physics, no heavy animation libraries — a small vanilla script only.
- No autoplaying audio/video in cards.
- No change to Projects/Writing/Contact page *structure* (only theme/type tokens update).
- Real Highlights imagery is added later by Simon via the CMS; ship with believable placeholders.

---

## 6. Acceptance criteria

- Home renders the centered Cormorant name + off-white blurb + nav, dark, header hidden.
- Orbit shows Highlights, rotates slowly, hover pauses + enlarges + captions, click follows links.
- `prefers-reduced-motion` freezes the orbit; mobile shows the calm gallery; both look intentional.
- Dark is the default site-wide; light toggle still works; inner pages cohesive in the new palette/type.
- Lighthouse ≥ 95 (perf/a11y/best-practices/SEO), WCAG AA, no horizontal scroll at 360/768/1280, e2e + unit suites green.

---

## 7. Open inputs (not blocking the build)
- Real Highlights images + captions + links (placeholders ship first; Simon curates in `/admin`).
- Final blurb wording (current placeholder is fine to ship).
