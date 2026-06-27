# CLAUDE.md — simonkuester.com

Project context for Claude Code sessions. Read this first.

## What this is
Personal professional website for **Simon Kuester**, a cybersecurity professional — a recruiter-facing portfolio + blog. **Live at https://simonkuester.com.**

## Stack
- **Astro 7** (static output, TypeScript strict). Zero client JS except a tiny home-page orbit script + the theme toggle.
- **Type:** Cormorant Garamond (display / `h1`) + Inter (everything else). Tokens in `src/styles/global.css`.
- **Theme:** **dark by default**, light available via the header toggle (persisted in `localStorage`, key `theme`).
- **CMS:** Sveltia CMS at `/admin` (config `public/admin/config.yml`), commits Markdown to this repo. Auth via a separate Cloudflare Worker `sveltia-cms-auth` (https://sveltia-cms-auth.simonkuester.workers.dev) + a GitHub OAuth App.
- **Content collections** (`src/content.config.ts`): `posts`, `projects`, `highlights`. Schemas use `astro/zod`.
- **Hosting:** Cloudflare (Workers static-assets deploy, project **`simonkuester-website`**), Git-connected to GitHub **`Simoon896/simonkuester.com`**. Pushing `main` auto-deploys (~1 min). DNS is on Cloudflare (nameservers moved from **Namecheap**).

## Commands
```bash
npm run dev        # local dev (http://localhost:4321)
npm run build      # static build -> dist/
npm run check      # astro check (1 known harmless Zod .url() hint)
npm run test:unit  # Vitest (src/**/*.test.ts)
npm run test:e2e   # Playwright (tests/e2e/*.spec.ts) — builds+previews itself
```
**Windows / automation notes:** never run `npm run dev`/`astro preview` in the foreground from automation (they block) — use `build`/`test:e2e`. Playwright's webServer reuses an existing server on :4321, so kill stray dev servers before screenshotting or you'll capture stale content.

## Layout of the code
- `src/pages/index.astro` — the **home "Orbit" cover** (see below). Uses `<BaseLayout cover>`.
- `src/pages/{about,contact,404}.astro`, `src/pages/projects/`, `src/pages/writing/` — inner pages.
- `src/layouts/BaseLayout.astro` — `<head>`/SEO/OG, theme bootstrap, header/footer. Prop `cover` hides the header + footer and shows a corner theme toggle (used only by the home page).
- `src/components/` — `Header`, `Footer`, `ThemeToggle`, `Container`, `Orbit`, `PostCard`, `ProjectCard`, `Tag`, `FormattedDate`.
- `src/content/{posts,projects,highlights}/*.md` — content.
- `public/admin/` — Sveltia CMS. `public/uploads/highlights/` — orbit photos.

## The home page (Orbit cover)
A dark, full-screen cover: centered **name + one-line blurb + nav only**, wrapped by a slowly **rotating ring of "Highlights" photo cards** (`src/components/Orbit.astro`, fed by the `highlights` collection). Behavior:
- The ring shows **only on screens ≥ 900px wide AND when motion is allowed**. Below that (narrow windows / mobile / `prefers-reduced-motion` / no-JS) the orbit is **hidden entirely** — just the name + nav.
- Hover/focus a card → pauses the ring + enlarges that card + shows its caption. Cards with a `link` navigate; others are inert.
- Identity always renders above the cards (z-index) with a theme-aware center scrim, so it stays legible in both themes.
- Progressive enhancement: cards are real `<a><img alt></a>` links in the HTML (SEO/a11y); the script only adds the ring.

## Design preferences (important — the owner is particular)
- **Minimal / editorial, quiet, dark.** Avoid: "AI gradient" looks, corny cybersecurity clichés (matrix green, terminal gimmicks), loud effects.
- **Motion sensitivity:** heavy/global motion (parallax, whole-field drift) makes the owner queasy. Keep animation **calm, slow, and localized**; always honor `prefers-reduced-motion`.

## Deployment gotchas (do not "fix" these)
- **`package-lock.json` is gitignored on purpose.** A Windows-generated lockfile omits Linux-only optional deps and breaks Cloudflare's `npm ci`; without a committed lockfile, Cloudflare uses `npm install`. Don't commit a lockfile.
- **`.nvmrc` pins Node 22** (Astro 7 needs ≥22.12).
- `_source-images/` (photo originals/zips) is gitignored — only the optimized copies in `public/uploads/` ship.

## Current state & next steps
Built and **deployed live**. Quality bar held: Lighthouse ~99/100/100/100, WCAG AA, e2e 32 + unit 2 passing.

**Still placeholders to replace (low effort):**
- `public/resume.pdf` — currently a stub; drop in the real résumé.
- About-page **bio + experience** (`src/pages/about.astro`) and the **LinkedIn URL** (in `Header`/`Footer`/`contact.astro`) — hardcoded placeholders.
- Orbit **photo captions** ("The Alamo", "Gothenburg"…) are placeholders — edit in `/admin` → Highlights, or in `src/content/highlights/`.
- The 2 sample **projects** and 2 sample **posts** — replace via `/admin`.

**Recommended follow-ups:**
- A **1200×630 raster OG image** (social link previews currently fall back to the favicon SVG, which most platforms won't render).
- Optionally make linkless orbit cards open a lightbox; optionally make About/Home copy CMS-editable.

## Specs & plans
- Original build: `docs/superpowers/specs/2026-06-26-personal-website-design.md`, `docs/superpowers/plans/2026-06-26-simonkuester-website.md`.
- Home redesign: `docs/superpowers/specs/2026-06-26-home-redesign-design.md`, `docs/superpowers/plans/2026-06-26-home-redesign.md`.

## Conventions
Conventional Commits. Keep tests green (`test:unit` + `test:e2e`) and `npm run build` clean before pushing. Pushing `main` ships to production — verify locally first.
