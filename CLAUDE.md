# CLAUDE.md — simonkuester.com

Project context for Claude Code sessions. Read this first.

## What this is
Personal professional website for **Simon Kuester**, a cybersecurity professional — a recruiter-facing portfolio + blog. **Live at https://simonkuester.com.**

## Stack
- **Astro 7** (static output, TypeScript strict). Client JS is minimal: the home-page blob-field physics (`BlobField.astro`) + the theme toggle. **Page transitions** use Astro View Transitions (`ClientRouter` in `BaseLayout`) — a soft cross-fade defined in `global.css`.
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
- `src/pages/index.astro` — the **home blob-field cover** (see below). Uses `<BaseLayout cover>`.
- `src/pages/{about,contact,404}.astro`, `src/pages/projects/`, `src/pages/writing/` — inner pages.
- `src/layouts/BaseLayout.astro` — `<head>`/SEO/OG, theme bootstrap (+ delegated theme-toggle handler that survives transitions), `ClientRouter`, header/footer, and `PaintSplotches` on non-cover pages. Prop `cover` hides the header + footer and shows a corner theme toggle (home only).
- `src/components/` — `Header`, `Footer`, `ThemeToggle`, `Container`, `BlobField` (home cover), `PaintSplotches` (inner-page corner decor), `PostCard`, `ProjectCard`, `Tag`, `FormattedDate`. `Orbit` (original photo orbit) + `BlobOrbit` (a CSS-orbit iteration) are **unused backups** of earlier home treatments — not imported, kept for reference.
- `src/content/{posts,projects,highlights}/*.md` — content. (`highlights` now feeds only the backup photo `Orbit`; the live home is abstract.)
- `public/admin/` — Sveltia CMS. `public/uploads/highlights/` — photos for the backup orbit.

## The home page (blob-field cover)
A dark, full-screen cover: centered **name + role + nav + a "drag and release the balls :)" hint**, over a field of **bright, draggable, physics-driven blobs** (`src/components/BlobField.astro` — CSS-styled gradient blobs + a small `requestAnimationFrame` loop). Behavior:
- 6 gradient blobs drift DVD-style, **collide** with each other and the walls (elastic, with an eased "slimy" squash), and can be **grabbed and flung** with the mouse (a goo-filter slime stretch while dragging; off-drag the tail is glued so a fast blob stays one clean circle).
- Shows **only ≥ 900px wide**; below that (mobile/narrow) the home is text-only. `prefers-reduced-motion` freezes it to a static spread. The field is decorative (`aria-hidden`); identity sits above it (z-index) with a theme-aware center scrim. The hint shows only ≥900px + motion-allowed (where the balls are actually draggable).
- The blob field re-initialises on each View-Transition navigation (`astro:page-load`) and cleans up on `astro:before-swap`.

**Inner pages** get sparse, flat, **crisp paint splotches** in the corners (`src/components/PaintSplotches.astro`, added by `BaseLayout` on non-cover pages): 3 per page, **seeded from the path** (each section differs — one top corner, one diagonal bottom corner, one mid-edge), slowly drifting/morphing, **behind** the content in the margins, **≥1024px only**, frozen under reduced-motion.

## Design preferences (important — the owner is particular)
- **Minimal / editorial, quiet, dark.** Avoid: "AI gradient" looks, corny cybersecurity clichés (matrix green, terminal gimmicks), loud effects.
- **Motion sensitivity:** heavy/global motion (parallax, whole-field drift) makes the owner queasy. Keep animation **calm, slow, and localized**; always honor `prefers-reduced-motion`.

## Deployment gotchas (do not "fix" these)
- **`package-lock.json` is gitignored on purpose.** A Windows-generated lockfile omits Linux-only optional deps and breaks Cloudflare's `npm ci`; without a committed lockfile, Cloudflare uses `npm install`. Don't commit a lockfile.
- **`.nvmrc` pins Node 22** (Astro 7 needs ≥22.12).
- `_source-images/` (photo originals/zips) is gitignored — only the optimized copies in `public/uploads/` ship.

## Current state & next steps
Built and **deployed live**, including the **June 2026 redesign**: the interactive blob-field home cover, inner-page paint splotches, and the cross-fade page transition. Tests green: **e2e 34 + unit 2**.

**NEXT UP — content (the current focus for this/next session):**
- **About page** (`src/pages/about.astro`) — write the real bio + experience. Simon is now a **Cybersecurity Engineering Associate @ Genix Cyber** (reflected in the home role line); the About copy is still placeholder.
- **Write-ups / blog posts** — replace the 2 sample posts in `src/content/posts/` with real writing, and add new ones. (Editable via `/admin` or by adding Markdown.)
- **Projects** — replace the 2 sample projects in `src/content/projects/` with real work.
- **LinkedIn URL** (hardcoded placeholder in `Header`/`Footer`/`contact.astro`) and `public/resume.pdf` (stub) — drop in the real ones.

**Recommended follow-ups:**
- A **1200×630 raster OG image** (social previews currently fall back to the favicon SVG, which most platforms won't render).
- Optional polish: tune the blob/splotch look (saturation, count, breakpoints) if desired.

## Specs & plans
- Original build: `docs/superpowers/specs/2026-06-26-personal-website-design.md`, `docs/superpowers/plans/2026-06-26-simonkuester-website.md`.
- Home redesign: `docs/superpowers/specs/2026-06-26-home-redesign-design.md`, `docs/superpowers/plans/2026-06-26-home-redesign.md`.

## Conventions
Conventional Commits. Keep tests green (`test:unit` + `test:e2e`) and `npm run build` clean before pushing. Pushing `main` ships to production — verify locally first.
