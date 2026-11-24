# Inner pages redesign: design

Date: 2026-11-24 (revised the same day after round three of mockups)
Status: draft for Simon's approval
Scope: every page except the home cover. That is About, the new combined Work page,
Contact, project pages, post pages and 404.

## Why

Simon likes the home cover (big serif name, draggable balls) and wants to keep it.
He finds the inner pages "too simple", "templatey" and "boxed in". A review on
2026-11-24 found why:

- They look like a different site from the cover. The serif appears only in the page
  title, and everything else is a narrow column of Inter.
- Every page has the same skeleton: title, grey intro line, stacked list.
- Three different left edges (header, narrow content, wide Projects).
- Stock parts: identical outlined pills, bordered hover cards, a left-border timeline,
  "Read →" links.
- The corner paint splotches read as wallpaper and collide with the header between
  about 1024 and 1200px wide.
- Project cover images have no set dimensions, so cards jump while loading.
- Contact is three rows and then empty space.

The audience is recruiters and security people arriving from LinkedIn. The site has to
look considered and be quick to scan.

## Goals

- Inner pages look like they belong to the home cover.
- Pages feel open: content uses the full page width, with no boxes drawn around things.
- Each page is quick to scan for a recruiter.
- One grid and one set of parts across all inner pages.
- Projects and Writing become one section.

## Non-goals

- No redesign of the home cover. Its nav labels change to match the new sections, and
  its role line changes only if Simon says the job title there is the wrong one.
- No content rewrite beyond the lines listed under "Copy changes". New projects, an
  About refresh and the LinkedIn work are separate, later tasks.
- No change to the content collections or the CMS config. Projects and posts stay
  separate collections; only the pages that list them are merged.
- Security headers (CSP and so on) are Cloudflare settings and are not part of this.

## Anti-goals

- Motion that runs on its own. Simon is motion sensitive. Nothing on an inner page moves
  unless the visitor touches it, and `prefers-reduced-motion` is always honoured.
- Cybersecurity clichés (matrix green, terminal styling) and loud gradients on text.
- Broken links. Project and post URLs that are already public keep working.
- Anything that makes a page harder to read or navigate in exchange for looks.

## Approaches considered

Round one, three directions mocked up on the About page:

- **A. Carry the cover inside.** One ball in a section colour beside a large serif title,
  a left rail for labels, pills and cards replaced by type.
- **B. Pure editorial.** No decoration, a fact sheet beside the essay.
- **C. One continuous canvas.** All six balls rest at the bottom of the window and can be
  thrown. Most distinctive, most motion, and the balls sit over the reading area.

Simon picked **A plus B's fact sheet**, without the Focus section.

Round two: he found A's poster-sized title out of proportion and redundant with the
header. A1 (smaller title) and A2 (no title, the opening line leads) were mocked up.
**Simon picked A2.**

Round three: he asked for Projects and Writing to be combined, for the post and project
pages to feel less boxed in, and for a less boring Contact page. Those were mocked up in
the A2 language.

Round four, Simon's edits to round three: no ball after the opening sentences, no rule
above the onward row, Contact as a single screen with no onward row and its intro in
full ink, and less awkward spacing at the top of Work. This document describes the
result.

The reference mockups are throwaway pages in `src/pages/mock/`:
`_Shell.astro` (header, onward row, shared styles), `a2.astro` and
`_AboutBody.astro` (About), `work.astro`, `post.astro`, `project.astro`, `contact.astro`.
They show the intended look. They must be deleted as part of this work and never deployed.

## The design

### Sections and URLs

Three sections: **About**, **Work**, **Contact**. "Work" is the combined Projects and
Writing page. *(The name is my call. It is the plainest word that covers both things
built and things written about them.)*

- `/work/` is new and lists projects, then posts.
- Project pages stay at `/projects/<slug>/` and post pages stay at `/writing/<slug>/`,
  so links already shared, the RSS feed and search results keep working. *(My call.)*
- `/projects/` and `/writing/` redirect to `/work/`.
- `/rss.xml` and the sitemap stay as they are.
- The home cover's nav becomes About, Work, Contact.

### What every inner page shares

**Header.** Wordmark on the left, the three section links, the theme toggle. No rule
under the header. The link for the current section is in full ink and is followed by a
small ball in that section's colour. This marker replaces the page title. Project and
post pages mark Work. On phones the header must stay on one line (in the mockup the
toggle wraps; fix that).

**Opening statement.** The page opens on one or two sentences in large Cormorant Garamond
(about 1.9rem on phones up to about 2.9rem on desktop, weight 500, line height about
1.15), in full ink, left aligned to the wordmark, at most about 22em wide, ending with
normal punctuation. Space above it is about 1.75rem to 3rem, and below it about 2rem to
3.25rem. No ball or other mark follows it, on any page.

**Section colours.** Taken from the cover's balls, using the same gradients:

| Section | Ball gradient | Accent in dark theme | Accent in light theme |
|---|---|---|---|
| About | `#caa0ff` to `#8f47ff` (purple) | `#caa0ff` | `#6b34d6` |
| Work, project and post pages | `#ffce6a` to `#ff7a30` (orange) | `#ffb26b` | `#a8480a` |
| Contact | `#ff90c5` to `#ff3d9c` (pink) | `#ff90c5` | `#c2186f` |
| 404 | `#86b6ff` to `#3f72ff` (blue) | `#86b6ff` | `#2f55d4` |

On each inner page links and buttons (`--accent`) take that section's accent instead of
terracotta. The builder must check every accent used as text reaches 4.5:1 against the
page background in both themes and adjust the shade if not. Terracotta stays as the
default token, so the home cover is unaffected.
*(My call. It matches the mockups Simon has seen. It is one token per section, so going
back to terracotta everywhere is a small change.)*

**Grid.** One page width (`--maxw-page`, 64rem) with the same side padding as the header,
so the wordmark, the statement and the content share a left edge. Pages with a rail use
a rail of about 15rem, a gap of about 4.5rem and a text column of at most 38rem. Below
about 900px everything stacks to one column, rail first.

**Type.** Cormorant Garamond for the statement, section headings (about 2rem, weight 600)
and item titles. Inter for body text and rail text. Rail labels are small, muted and in
sentence case. No uppercase tracked labels, no middle-dot separators, no arrow glyphs.

**No boxes.** No borders or cards around content. Structure comes from spacing, the grid
and the thin rules between rail rows. Nothing else gets a rule.

**Onward row.** About, Work, project pages, post pages and 404 end with the other
sections in large serif type (about 1.8rem to 3rem), each followed by a small ball in its
own colour. There is no rule above it; it sits after a generous gap and blends into the
page. On hover the ball grows slightly. The 404 page lists all three. Contact has no
onward row. The section-coloured balls now appear only here and in the header marker.

**Footer.** Unchanged in content. The year comes from the build date.

**Removed.** The corner paint splotches (`PaintSplotches.astro`) and the pill `Tag`
component are deleted. `ProjectCard` and `PostCard` are replaced by rows.

### About

- Statement: the Minecraft story (the current lede).
- Rail, staying in view while the essay scrolls on desktop: Role, Company, Education,
  Certifications, then the "Download resume (PDF)" button.
- Text column: the two "what I do now" paragraphs, then "Experience" (each job as a
  serif title, a muted line with company and dates, then the paragraph), then
  "Outside work".
- The Focus areas section is removed. The education sentence moves into the rail.

### Work

- Statement: see "Copy changes".
- Two groups, each under a serif heading styled like About's "Experience" (about 2rem,
  no rule, close to its first row): "Projects" (ordered by `order`, ties broken by
  title), then "Writing" (newest first, drafts excluded).
- Each entry is an open row across the full page width, in three columns: the period or
  date on the left (about 9rem, muted); in the middle the title in serif (about 1.6rem
  to 2.2rem) linking to the entry, the summary, and for projects the tools as one muted
  comma-separated line; on the right a picture about 19rem wide at 4:3 with rounded
  corners, when the entry has a `coverImage`. Entries without a picture leave that
  column empty.
- A cover that is a logo (the StrongDM one) sits centred on a light panel instead of
  being cropped. The builder decides how a cover is marked as a logo; a front matter
  flag is not wanted, so judging by aspect ratio is fine.
- Rows are separated by space, not lines. On phones the picture goes first.

### Post page

- Statement: the post title. This is the page's `h1`.
- If the post has a `coverImage`, it runs the full page width under the title, cropped
  to about 2:1, rounded corners, with real alt text. `coverImage` is already in the post
  schema and the CMS. Alt text for it needs a home: add an optional `coverAlt` field to
  the post schema and CMS config. *(This is the one schema addition.)*
- Rail (in view while scrolling): Posted, Reading time, Topics (the tags as a plain
  list), then an "All work" link.
- Text column at the 38rem measure. Pictures in the text have rounded corners and, on
  desktop, run past the words to the page's right edge. Blockquotes are set as pull
  quotes: serif, about 1.5rem to 1.9rem, ink colour, a thin accent rule on the left.
- The Identity Week post currently repeats its cover as the first picture in the body.
  Remove that inline copy when the cover moves to the top.

### Project page

- Statement: the project title. This is the page's `h1`.
- Rail: When, Built with (the tools as a list), Links (from front matter), "All work".
- Text column: the summary as a larger serif lead, the cover image (running to the right
  edge on desktop, at its natural shape; a logo cover is shown small on a light panel),
  then the body with serif section headings.
- Cover images get explicit `width` and `height` so nothing jumps while loading.

### Contact

- A single screen: header, content, footer, with no scrolling on a laptop or desktop
  (checked at 1280×720 and up). The content block sits centred in the space between
  header and footer. Phones may scroll.
- Statement, smaller here (about 1.5rem to 2rem) because the address is the main event,
  but in full ink like every other statement: see "Copy changes".
- The email address itself in very large serif type, as large as the page allows (about
  1.75rem on phones up to about 6rem on desktop), as a `mailto:` link. It must never
  cause horizontal scroll.
- A "Copy email" button under it that copies the address and confirms with "Copied".
- Then an open three-column row: GitHub, LinkedIn, Resume. Each has a small muted label
  and its value as a serif link. One column on phones.
- No onward row. The header and footer are enough.

### 404

- Statement: "That page doesn't exist."
- Onward row listing all three sections. No section is marked in the header.

### Copy changes

Only these lines change. They follow Simon's voice notes: contractions, plain words, no
em-dashes.

| Page | Now | Proposed |
|---|---|---|
| Work | Projects: "Selected work that I'm most proud of. Continuously updating this page as I work on new projects!" Writing: "Creating weekly posts about cybersecurity, new projects, and whatever else that comes to mind" | "Projects I've built and posts I've written. I keep adding to this page as I make new things." |
| Contact | "Want to discuss about something? Shoot me an email and I'll be sure to get back to you." | "Want to talk about something? Shoot me an email and I'll get back to you." |

### Small fixes folded in

- Theme toggle: replace the ☀ / ☾ text glyphs with inline SVG icons.
- Footer year from the build date.
- Job title: use **"Cybersecurity Engineering Associate"** everywhere on the site (Simon,
  2026-11-24). The home cover already says it. About changes in three places: the
  current role in Experience, the "I'm a cybersecurity associate" sentence, and the page
  description in `about.astro`. The rail's Role row uses it too. `public/resume.pdf`
  still says "Cybersecurity Associate"; it's a PDF Simon maintains, so he updates it
  himself.
- Share image: `og:image` still points at `/favicon.svg`, which LinkedIn won't show. Add
  a 1200×630 PNG in `public/` that looks like the cover (name, role, a few balls on the
  dark background) and make it the default in `BaseLayout.astro`.

## Constraints

- Astro 7, static output, TypeScript strict. No new runtime dependencies. The copy button
  is the only new client JS, and it must work with Astro View Transitions (set up on
  `astro:page-load`, no leaked listeners across navigations).
- Hosting is Cloudflare Workers static assets. The two redirects must work there.
- Self-hosted fonts only (already in place).
- Dark by default, light available. Every colour choice has to work in both.
- No horizontal scroll at 360, 768 and 1280px.
- Exactly one `h1` per page. On About, Work and Contact the `h1` is the section name,
  visually hidden, because the header marker does the visible job. On project and post
  pages the `h1` is the visible title.
- `package-lock.json` stays uncommitted. The repo root holds unrelated untracked files,
  so files are staged by name, never with a blanket add.
- Pushing `main` deploys, so nothing is pushed until Simon has seen the built result
  locally and said go.

## Testing

- Keep `npm run build`, `npm run check`, `test:unit` and `test:e2e` green.
- Update the e2e tests that name the old sections (`nav`, `a11y`, `responsive`) to
  About, Work, Contact.
- Replace the two paint-splotch tests with tests that each inner page shows its opening
  statement, and that every inner page except Contact ends with the onward row.
- Add tests that: the header marks the right section on Work and on a post page;
  `/projects/` and `/writing/` land on `/work/`; Contact does not scroll at 1280×720;
  the copy button shows "Copied".
- Check each inner page by eye in dark and light, at phone, tablet and desktop widths.

## Left to the builder

- Component and file structure (for example a shared page shell, a section map keyed by
  path, shared rail and row styles).
- Exact spacing and type sizes within the ranges above, using the mockups as the
  reference.
- How the redirects and the share image are produced.
- Whether `Orbit.astro` and `BlobOrbit.astro` (unused backups) stay. Default: leave them.

## Calls I made that Simon should check

1. The combined section is called "Work".
2. Project and post pages keep their current URLs; only the two list URLs redirect.
3. Links and buttons take the section colour on inner pages instead of terracotta.
4. The two intro lines under "Copy changes".
5. The paint splotches and the pill tags are deleted outright, not kept as backups.
6. The share image is included in this work.

## Decided

- The Identity Week post (`src/content/posts/identity-week-america-2026.md` and
  `public/uploads/identity-week-2026/`) ships with this redesign.
- The job title is "Cybersecurity Engineering Associate".
