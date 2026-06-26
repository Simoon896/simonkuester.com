# Personal Website — simonkuester.com — Design Spec

- **Date:** 2026-06-26
- **Owner:** Simon Kuester
- **Status:** Approved design, pending spec review → implementation plan

---

## 1. Overview

A personal, professional website for Simon Kuester, a cybersecurity professional. Its job is to make a strong, credible first impression on recruiters and hiring managers, showcase concrete work, and serve as a home for ongoing writing about the field.

**Primary audience:** recruiters, hiring managers, and security peers.

**One-line goal:** a fast, distinctive, professional site that's free to run and easy to publish to.

---

## 2. Goals & Success Criteria

The site is successful when all of the following are true:

- **Fast:** Lighthouse Performance ≥ 95 on mobile and desktop.
- **Accessible:** meets WCAG 2.1 AA (contrast, keyboard nav, semantics, alt text).
- **Responsive:** looks excellent on phones first (primary review device), then tablet/desktop.
- **Distinctive:** does not look like a generic template or "AI default"; has a deliberate point of view.
- **Easy to publish:** new posts/projects can be written and published from a web editor with no code.
- **Cheap:** $0/month beyond the already-purchased domain.
- **Findable & shareable:** SEO meta, sitemap, RSS, and clean OpenGraph link previews.

---

## 3. Scope

### In scope (v1)

- Five pages: **Home**, **About** (bio + experience + résumé), **Projects** (case studies), **Writing** (blog), **Contact**.
- Light and dark themes, **light as default**, with a toggle.
- Sveltia CMS for two content collections: **Posts** and **Projects**.
- RSS feed, `sitemap.xml`, OpenGraph/Twitter meta, favicon set.
- Automated quality checks (accessibility, responsive, links, dark mode) before launch.

### Non-goals (v1) — deliberately excluded to stay lean, cheap, and low-risk

- No backend, database, or server-side app.
- No comments system (privacy-friendly option may come later).
- No paid services or subscriptions.
- No heavy client-side JS framework (React/Vue) as the site foundation.
- No e-commerce, auth-walled content, or user accounts.

---

## 4. Architecture & Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro** | Built for content/portfolio sites; ships ~zero JS by default → fast + great SEO; first-class Markdown/MDX content collections; ideal canvas for custom design. |
| Repo | **GitHub** (free) | Source of truth for code *and* content; triggers deploys. |
| Hosting | **Cloudflare Pages** (free) | Global CDN, free SSL, git-connected CI/CD, auto-deploy on push. |
| CMS | **Sveltia CMS** (free, open-source) | Web editor at `/admin`; writes Markdown **into the GitHub repo** — user owns all content, no third-party data store. |
| CMS auth | **Cloudflare Worker** (free) | Tiny GitHub OAuth proxy so `/admin` login works on Cloudflare Pages. One-time setup. |

### Data flow (publishing)

```
You write in /admin (Sveltia)
        ↓  commit
GitHub repo (Markdown file)
        ↓  webhook
Cloudflare Pages builds the site (Astro)
        ↓  deploy (~1 min)
Live at simonkuester.com (static, CDN, free SSL)
```

Visitors are always served pre-built static HTML from the CDN — nothing dynamic at request time, which keeps it fast and the attack surface minimal.

---

## 5. Information Architecture

| Page | Purpose | Key content |
|---|---|---|
| **Home** | Establish credibility in seconds | Short, confident intro (who/what), 3–6 featured projects, latest writing, primary CTAs (résumé, contact). |
| **About** | The full story | Bio, focus areas/skills, experience/roles (timeline), downloadable résumé (PDF), optional headshot. |
| **Projects** | Prove the work | Grid of project case studies; each follows challenge → contribution → key decisions → outcome. |
| **Writing** | Ongoing voice | Reverse-chronological post list with summaries/tags; individual post reading view. |
| **Contact** | Make it easy to reach out | Email, LinkedIn, GitHub. (Simple `mailto` + links in v1; a form via a free service can be added later.) |

Global nav: **Home · About · Projects · Writing · Contact**, plus the theme toggle. Footer: social links, copyright, RSS.

---

## 6. Content Model (CMS collections)

### Posts (blog)
- `title` (string)
- `date` (date)
- `summary` (string, used in lists + meta description)
- `tags` (list)
- `coverImage` (image, optional)
- `draft` (boolean — hidden from production until false)
- `body` (Markdown)

### Projects (case studies — informed by 2026 portfolio research)
- `title` (string)
- `role` (string — your specific contribution)
- `period` (string, e.g., "2024–2025")
- `tools` (list — stack/technologies)
- `summary` (string — lead with problem + outcome)
- `challenge` (Markdown — the problem and constraints)
- `contribution` (Markdown — what *you* specifically did)
- `decisions` (Markdown — key design/technical decisions and reasoning)
- `outcome` (Markdown — measurable results where possible)
- `links` (list of {label, url} — repo, live, write-up)
- `coverImage` (image, optional)
- `featured` (boolean — surfaces on Home)
- `order` (number — manual sort)

---

## 7. Design System

Design language: **Minimal / Editorial**. Warm paper, near-black ink, one calm accent, confident typography, generous whitespace. Deliberately avoids "hacker" clichés (matrix green, terminal gimmicks) and loud gradients.

### Tokens

- **Color (light):** Paper `#FAF9F7`, Ink `#1A1A1A`, Muted `#6F6A63`, Hairline `#E6E2DC`, Accent (deep blue) `#23406E`.
- **Color (dark):** dark-mode equivalents to be finalized in build (target AA contrast in both themes).
- **Type:** Headings **Fraunces** (serif); body **Inter** (sans). Modular type scale; body line-height ~1.7; reading measure ~38em for posts.
- **Spacing:** consistent spacing scale (e.g., 4px base); generous section padding.
- **Radii / hairlines:** soft radii (8–14px), 1px hairline dividers.

Tokens are the single source of truth, defined once and consumed everywhere (defined/documented with the `design:design-system` skill).

### Components
Nav, footer, theme toggle, hero, primary button, text link (with signature underline), post card, project card, tag/pill, blockquote, code block, résumé download button.

### Motion
Subtle and tasteful only: hover states, gentle fade/slide on scroll. Always respects `prefers-reduced-motion`.

### Distinctive signature (parked — first-class goal, not v1-blocking)
The site must not look templatey. Candidate directions to choose from in a focused `frontend-design` pass: editorial section numbering (`01 — About`), a custom masthead/monogram treatment of the name, a restrained signature motif/hover interaction, or a recurring "field notes" format. One will be selected; launch does not depend on it.

### Theme behavior
Light is default. Toggle in nav. Remembers the visitor's choice; respects system preference on first visit.

---

## 8. Skills & Tooling

Build and quality process leans on these (researched and chosen for this project):

- **`frontend-design`** — primary design/build skill; drives taste, polish, and the distinctive signature; the antidote to generic output.
- **`design:design-system`** — define and document the design tokens for consistency as the site grows.
- **`design:ux-copy`** — microcopy and voice: hero, CTAs, case-study summaries, 404/empty states.
- **`design:accessibility-review`** — WCAG 2.1 AA audit.
- **`design:design-critique`** — structured critique pass on built pages before launch.
- **`engineering:testing-strategy`** + **`Playwright`** + **`verify`** — end-to-end and visual checks: pages render, nav works, theme toggle persists, responsive at phone/tablet/desktop, no broken links; screenshots for visual review.
- **Lighthouse** — performance/SEO verification against the ≥95 target.

Available but out of scope for a solo personal site: `design:user-research`, `design:research-synthesis`, `design:design-handoff`.

---

## 9. Quality Bar / Acceptance Criteria

Before calling v1 done:

- Lighthouse Performance, Accessibility, Best Practices, SEO all ≥ 95 (mobile + desktop).
- WCAG 2.1 AA verified (contrast in both themes, keyboard nav, focus states, alt text).
- Renders correctly at 360px, 768px, and 1280px widths.
- Light and dark themes both complete and consistent.
- No broken internal/external links.
- OpenGraph preview renders correctly when the URL is shared.
- RSS feed and sitemap validate.

---

## 10. Deployment

**Prerequisites (all free):** GitHub account, Cloudflare account, access to the domain at its registrar.

**Steps:**
1. Push the Astro repo to GitHub.
2. Connect the repo to Cloudflare Pages — build command `npm run build`, output directory `dist`.
3. Add `simonkuester.com` (and `www`) as a custom domain in Cloudflare Pages.
4. Point DNS at Cloudflare (simplest: move the domain's DNS to Cloudflare — free); SSL provisions automatically.
5. Deploy the Sveltia GitHub OAuth Worker so `/admin` login works.

**Ongoing cost:** $0/month. Every save in `/admin` auto-rebuilds and redeploys in ~1 minute.

---

## 11. Implementation Inputs (resolved)

1. **Registrar:** **Namecheap.** DNS will be pointed at Cloudflare (move nameservers to Cloudflare, or add the records Cloudflare provides at Namecheap). Exact steps in the implementation plan.
2. **GitHub:** existing account **`Simoon896`**.
3. **Content strategy:** build with believable **placeholder content** first (realistic for a cybersecurity professional); real bio, experience, résumé PDF, headshot, projects, and posts added afterward via `/admin`. The build must make swapping placeholders for real content trivial.
4. **Contact email:** **`simonkuester@gmail.com`**.

---

## 12. Future / Optional (post-v1)

- Dedicated **distinctive-signature** design pass.
- **Cloudflare Web Analytics** (free, privacy-friendly, no cookies) for traffic insight.
- Privacy-friendly **comments** on posts.
- **Contact form** via a free service (e.g., Formspree free tier) or a Cloudflare Pages Function.
- Newsletter/subscribe.
