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
- Inner pages: `src/pages/{about,work,contact,404}.astro`, project pages `src/pages/projects/[...slug].astro`, post pages `src/pages/writing/[...slug].astro`. **Work** (`/work/`) lists projects then posts; the old `/projects/` and `/writing/` list URLs redirect to it (`redirects` in `astro.config.mjs`), while detail pages keep their `/projects/<slug>/` and `/writing/<slug>/` URLs.
- `src/lib/sections.ts` — the three sections (About, Work, Contact): nav order, `sectionForPath()`, and each section's ball gradient + link accent (dark/light). Projects and posts count as Work.
- `src/layouts/BaseLayout.astro` — `<head>`/SEO/OG (default share image `/og.png`; a post with a cover shares its cover), theme bootstrap (+ delegated theme-toggle handler that survives transitions), `ClientRouter`, the section colour variables, header/footer, and the `Onward` row. Props: `cover` (home only: no header/footer, corner toggle), `onward` (default true), `fill` (one-screen layout, used by Contact).
- `src/components/` — `Header` (marks the current section with a dot in its colour), `Onward` (row of the other sections that ends each inner page), `Footer`, `ThemeToggle`, `FormattedDate`, `BlobField` (home cover), `Container` (now unused). `Orbit` + `BlobOrbit` are **unused backups** of earlier home treatments — not imported, kept for reference.
- `src/utils/image-size.ts` — reads PNG/JPEG sizes from `public/` at build time (width/height attributes, logo-shaped covers).
- `src/content/{posts,projects,highlights}/*.md` — content. (`highlights` now feeds only the backup photo `Orbit`; the live home is abstract.)
- `public/admin/` — Sveltia CMS. `public/uploads/highlights/` — photos for the backup orbit.

## The home page (blob-field cover)
A dark, full-screen cover: centered **name + role + nav + a "drag and release the balls :)" hint**, over a field of **bright, draggable, physics-driven blobs** (`src/components/BlobField.astro` — CSS-styled gradient blobs + a small `requestAnimationFrame` loop). Behavior:
- 6 gradient blobs drift DVD-style, **collide** with each other and the walls (elastic, with an eased "slimy" squash), and can be **grabbed and flung** with the mouse (a goo-filter slime stretch while dragging; off-drag the tail is glued so a fast blob stays one clean circle).
- Shows **only ≥ 900px wide**; below that (mobile/narrow) the home is text-only. `prefers-reduced-motion` freezes it to a static spread. The field is decorative (`aria-hidden`); identity sits above it (z-index) with a theme-aware center scrim. The hint shows only ≥900px + motion-allowed (where the balls are actually draggable).
- The blob field re-initialises on each View-Transition navigation (`astro:page-load`) and cleans up on `astro:before-swap`.

**Inner pages (Nov 2026 redesign, spec `docs/superpowers/specs/2026-11-24-inner-pages-redesign-design.md`):** no page titles and no boxes. Each page opens on a large serif **statement** (`.statement`), uses a **rail of facts beside a text column** (`.cols` / `.rail`) where it fits, and ends with the **onward row** of the other sections (not on Contact). Each section takes one of the cover's ball colours for its header dot, links and buttons (About purple, Work orange, Contact pink, 404 blue). Contact is a single screen built around the email address with a copy button. Shared classes live in `global.css`. The old corner paint splotches, cards and pill tags are gone.

## Design preferences (important — the owner is particular)
- **Minimal / editorial, quiet, dark.** Avoid: "AI gradient" looks, corny cybersecurity clichés (matrix green, terminal gimmicks), loud effects.
- **Motion sensitivity:** heavy/global motion (parallax, whole-field drift) makes the owner queasy. Keep animation **calm, slow, and localized**; always honor `prefers-reduced-motion`.

## Deployment gotchas (do not "fix" these)
- **`package-lock.json` is gitignored on purpose.** A Windows-generated lockfile omits Linux-only optional deps and breaks Cloudflare's `npm ci`; without a committed lockfile, Cloudflare uses `npm install`. Don't commit a lockfile.
- **`.nvmrc` pins Node 22** (Astro 7 needs ≥22.12).
- `_source-images/` (photo originals/zips) is gitignored — only the optimized copies in `public/uploads/` ship.

## Current state & next steps
Built and **deployed live** at https://simonkuester.com. Everything below is shipped:
- **June 2026 redesign** — interactive blob-field home cover, inner-page paint splotches, cross-fade transitions.
- **Nav + theme polish (2026-06-27)** — dropped the redundant Home nav item (the wordmark links home); wordmark is now bold (700), larger (1.25rem) Cormorant serif (the 700 weight is imported in `global.css`); **accent changed from cool blue to warm terracotta** to match the warm palette: `--accent` `#A0522D` (light) / `#DDA07C` (dark) in `global.css`.
- **Content is real** — About page fully written (`about.astro`: Genix roles, education, origin story, focus areas, outside work); **2 real projects** (`ai-detection-engineering-platform`, `strongdm-argus-integration`, cover images in `public/uploads/`); **first real blog post** (`building-this-site.md`); the old sample posts/projects are gone.
- **Real links/assets** — LinkedIn is the real URL (Footer + `contact.astro`); `public/resume.pdf` is the real resume (~140KB, 1 page). (The header has no LinkedIn link by design — just wordmark + nav + theme toggle.)
- **Security/infra** — HTTPS enforced + HSTS; `security.txt` at `public/.well-known/`.

Always keep `test:unit` + `test:e2e` green and `npm run build` clean before pushing (pushing `main` ships to prod).

**November 2026 refresh:** dependencies updated (npm audit clean), the inner pages redesigned (see above), and a second post (`identity-week-america-2026.md`, Identity Week America, Sep 2026, photos in `public/uploads/identity-week-2026/`). Job title everywhere on the site is **"Cybersecurity Engineering Associate"** — `public/resume.pdf` still says "Cybersecurity Associate" until Simon replaces it. Next after the site: updating Simon's LinkedIn profile.

**Adding content:** a project is `src/content/projects/<slug>.md`, a post is `src/content/posts/<slug>.md` (fields per `src/content.config.ts`; posts can set `coverImage` + `coverAlt`). Put images in `public/uploads/` with hyphenated filenames (the StrongDM cover's space in `strongdm logo.png` is a known wart). Or use `/admin`.

**LAUNCH-READINESS CHECKLIST (before announcing on LinkedIn):**
- [x] **OG image** — `public/og.png` (1200×630, name + role + cover balls) is the default share image.
- [ ] **Visual QA** — dark (default) + light toggle, desktop + mobile, across home/about/work/contact and a post + project. (e2e covers no-horizontal-scroll at 360/768/1280.)
- [ ] **Proofread** — known typo in `building-this-site.md`: "what I found when I **scanned performed** a security scan" (drop "scanned"). Skim every lede/post once.
- [ ] **Security review** — run the checklist below.

**SECURITY CHECKLIST (Simon runs this before launch):**
- [ ] `npm audit` — dependency vulnerabilities.
- [ ] **Secret scan** — no secrets/keys/tokens in the working tree OR `git log` history (`.env`, API tokens, the GitHub OAuth App secret, Cloudflare API tokens). The OAuth secret must live only in the `sveltia-cms-auth` Worker, never in this repo.
- [ ] **Live security headers** — confirm HSTS present + HTTP→HTTPS redirect; consider adding **CSP**, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and frame-ancestors/`X-Frame-Options` (these are Cloudflare config, not in the repo).
- [ ] **`security.txt`** — `Contact:` correct and `Expires:` not in the past.
- [ ] **CMS/admin** — `/admin` (Sveltia) is publicly reachable but writes require GitHub OAuth via the worker; confirm the OAuth App callback + scopes are minimal and the worker secret is set; no tokens should reach the client.
- [ ] **Drafts** — no `draft: true` content exposed; nothing sensitive published.

**Optional polish:** tune the blob/splotch look (saturation, count, breakpoints) if desired.

## Specs & plans
- Original build: `docs/superpowers/specs/2026-06-26-personal-website-design.md`, `docs/superpowers/plans/2026-06-26-simonkuester-website.md`.
- Home redesign: `docs/superpowers/specs/2026-06-26-home-redesign-design.md`, `docs/superpowers/plans/2026-06-26-home-redesign.md`.

## Conventions
Conventional Commits. Keep tests green (`test:unit` + `test:e2e`) and `npm run build` clean before pushing. Pushing `main` ships to production — verify locally first.
