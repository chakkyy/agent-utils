---
name: html-deliverable
description: Build a polished single-file local HTML page to communicate or visualize something — project kickoffs, QA guides, meeting material, comparisons, evidence, explanations of a topic. Use when the user asks to "create an HTML" for one of those, or wants a better way to present a document than plain text. Do NOT use for pages inside an existing app or website, for standalone diagrams, or when the user explicitly asks for another format (Artifact, slides, markdown).
license: MIT
---

# HTML deliverable — the recipe

One local HTML file, everything in a single file, opened in the browser when done.
**Local file > hosted artifact**: no CSP restrictions, CDN fonts and icons work,
and the result looks far better. Only reach for a hosted/shareable artifact if
the user needs a URL and asks for one.

## Where to save it

Wherever the user says; if they don't, in the project's workspace root with a
short, descriptive name (`kickoff-ds.html`, `qa-guide-checkout.html`). Keep it
out of version control — don't commit it unless explicitly asked.

## Invariant structure + variable theme

The STRUCTURE is always the same. The STYLE varies by theme.

### Choosing the theme

- **User active in the session**: ask one question (via the harness's
  question tool if available, otherwise a short plain-text question):
  recommend one theme based on the content with a one-line why, list the
  rest, and leave room for a custom theme in the user's own words. Repeating
  the previous theme is fine when the subject is the same or the page belongs
  to a series — consistency beats novelty there.
- **Autonomous run** (a goal-mode task, scheduled job, unattended session):
  decide alone from the theme table's "When" column — never block the flow on
  a question; record the choice and the one-line reason in the `<head>`
  comment.

### Invariant (every theme)

- Header shell (project wordmark left, mono metadata + toggle right) · pill
  nav with anchors when there are 4+ sections · sections with
  `scroll-margin-top` · footer mirroring the wordmark.
- **The shell is sticky**: header (and pill nav, if present) stay pinned while
  scrolling as translucent material (blur + saturate, content passes under),
  so the light/dark toggle and the anchors are always reachable. Solid
  fallbacks under `prefers-reduced-transparency` / `prefers-contrast: more`.
- **Light/dark toggle** (default-on): a small button at the right end of the
  header shell switches color scheme. Initial state follows
  `prefers-color-scheme`; the choice persists in `localStorage`. Implement by
  re-declaring the CSS variables under `html[data-theme="dark"]` (inverse for
  dark-first themes like terminal) — content styles read only the variables.
  Sun/moon glyph swap + `aria-pressed`; transition `background`/`color` at
  ~150ms ease-out, none under `prefers-reduced-motion`.
- Evidence as tables: caption below, sentence-case headers, numeric column
  `.num` right-aligned + mono `tabular-nums`. Big stats in a statline with
  dividers.
- Prose at 60–68 characters per line. Thin borders and whitespace over
  shadows; no nested cards.
- **One single accent = the project's brand color** (no brand? use one
  restrained blue), only where it means something, always with a non-color
  signal next to it. Semantic colors (ok/warn/error) are separate.
- Forbidden: ALL-CAPS eyebrows, decorative em-dashes, decorative gradients,
  glass effects, arbitrary icons, decorative section numbering, mini-sized
  prose.
- Voice: precise, calm, no hype; sentence case; write in the user's language;
  explain all jargon in plain words — the audience includes non-devs (PM,
  design).
- **Content-related favicon** (mandatory): pick one that represents the
  document's topic so the reader can tell tabs apart when several deliverables
  are open. Any source works — an emoji embedded as an SVG data URI
  (`<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>">`),
  an external icon URL, or the project's real favicon (local HTML has no CSP,
  so external sources are fine).
- Icons via `iconify-icon` from CDN
  (`https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js`) only
  when the icons ARE content; when comparing sets, label each with its library
  in small mono.

### Apple visual base (shared by every theme)

Every theme is a variation on the same Apple-derived base (see "Feel — the
Apple pass" below for the interaction half):

- Display type large and tight: `-0.02em` to `-0.035em` tracking, line-height
  1.02–1.1, hierarchy built from size + weight + leading as a set. Body at
  15–16px, line-height 1.5–1.65.
- Sticky chrome as translucent material (blur + saturate), content scrolling
  under; solid fallbacks for reduced transparency / more contrast.
- Rounded concentric radii (outer = inner + padding), generous whitespace,
  thin borders; depth from layering, never from heavy shadows.
- Font stacks always end in `system-ui` so the page degrades to the platform
  face gracefully.

### Themes (pick one, declare it in a comment in the `<head>`)

| Theme | When | Recipe |
|---|---|---|
| `apple` (default) | Kickoffs, plans, working docs, pitches, demos | Geist Sans + Geist Mono · white `#fff`, ink `#171717`, borders `#eaeaea` · **display dial**: working docs at weight 600 / ~2.5rem display; pitches at 800 / 3.5rem+ with huge stats and a more present accent |
| `terminal` | Technical evidence, QA, audits, debugging | Dark background `#0d1117`, ink `#e6edf3`, mono as protagonist (Geist Mono or JetBrains Mono), bright brand accent |
| `editorial` | Long-read docs, narrative proposals | Characterful serif for display (e.g. Newsreader/Fraunces) + sans for body · slightly warm paper · more leading |

The former `geist` and `bold` themes are merged into `apple` — the display
dial covers both registers; pick the position per document, don't mix
registers on one page.

A custom theme is valid when the subject calls for it (e.g. a dark-mode QA
review shown in dark) — keep the invariant structure, the Apple base and the
single-accent discipline.

## Design taste (polish pass before opening the file)

The details that separate a designed page from a default-looking one:

- **Hierarchy from size + weight, not color.** One display size for the page
  title, one for section headers, body at 15–16px. If everything is bold,
  nothing is.
- **Spacing on a scale** (4/8-based) and whitespace does the grouping: more
  space before a section than after its header; related blocks sit visibly
  closer than unrelated ones.
- **Typography micro**: `text-wrap: balance` on headings, `text-wrap: pretty`
  on body; `-webkit-font-smoothing: antialiased` on the root; slight negative
  letter-spacing (~`-0.02em`) on display sizes only — never letterspace
  lowercase body text.
- **Comparable numbers align**: mono `tabular-nums` not just in tables but in
  statlines and inline metrics, so digits line up and nothing shifts.
- **Concentric radii**: outer radius = inner radius + padding. A container and
  its nested element never share the same radius.
- **Optical over geometric**: nudge glyphs/icons that look off-center; a play
  triangle or chevron centered by math usually isn't centered to the eye.
- **Restraint compounds**: thin low-contrast `1px` borders; if any shadow is
  needed at all, nothing heavier than `0 1px 2px rgba(0,0,0,.04)`.
- **Links in prose**: real underlines with `text-underline-offset: 2px` and a
  muted `text-decoration-color` — not bare accent-colored text.
- **Signature micro-details** (cheap, high-perceived-craft): `::selection`
  tinted with the accent at low opacity; `scroll-behavior: smooth` for the
  pill-nav anchors, wrapped in `@media (prefers-reduced-motion: no-preference)`.
- **One quiet background device** (optional, max one per page): a low-contrast
  dot grid (`radial-gradient` dots at ~4% ink, 24px cell) or a single soft
  radial tint of the accent behind the hero, theme-aware via variables. It
  keeps the canvas from feeling sterile without competing with content. Never
  mesh/AI-purple gradients, never grain over tables, never two devices.

### Feel — the Apple pass (from the fluid-interfaces playbook)

- **Press feedback on pointer-down, not release**: anything clickable (nav
  pills, `summary`, buttons) gets `:active { transform: scale(.97) }` with a
  ~100ms ease-out transition. Animate only `transform`/`opacity`.
- **Leading tracks size inversely**: tight on display (`line-height` 1.05–1.1
  on the h1), loose on body (1.5–1.65). Hierarchy is size + weight + leading
  as a set, never size alone.
- **Scale with the reader**: key font sizes and spacing in `rem`/`em`, so a
  bumped browser text size enlarges the layout instead of breaking it.
- **Sticky chrome as material**: if the header or pill nav sticks, translucent
  background + `backdrop-filter: blur() saturate(180%)` with content scrolling
  under — a soft scroll edge, not a permanent hard border. Fall back to solid
  under `prefers-reduced-transparency` and to near-solid + defined border under
  `prefers-contrast: more`. (Functional translucency on chrome is allowed; the
  glass-effect ban targets decorative glassmorphism cards.)
- **Wayfinding labels**: nav pills name the section's contents ("Risks",
  "Decisions"), never generic umbrellas ("Info", "More"). Every screenful
  answers: where am I, where can I go, how do I get out.

## Reference skeleton

A complete example lives in [reference.html](reference.html) next to this file.
Read it before writing the first page of a session and clone its patterns:
CSS variables, shell header/footer, `.toc`, `.statline`, evidence tables,
`dl.gloss` (vocabulary), `.ba` (before/after), `.card.dec` + `.opts`
(decisions with a recommended option), `.tag` (status chips), `.ask`
(requests to other people).

The example happens to explain a planning question — but that's just one
deliverable type. The same structure and patterns serve a kickoff, a QA
guide, a feature explainer, a comparison, an audit, a post-mortem, meeting
material: swap the sections, keep the discipline. Its numbers and tickets
are illustrative sample data, labeled as such — never copy them into a real
deliverable.

## Content rules

- Real data only: if a number matters, verify it before publishing it (and
  when in doubt, say exactly what it measures: "565 rendered instances, 263
  files").
- **Everything with a source gets a link.** Any PR, ticket, doc, dashboard,
  config page, file or claim the page mentions that has a URL is a real `<a>` —
  PR numbers link to the PR, panels to the panel, claims to the doc that backs
  them. The reader must never have to hunt for an address the page already
  knows. Verify URLs instead of guessing them (a project key from the repo
  beats an invented slug); if something genuinely has no URL, it stays plain
  text — no dead or invented links.
- Every section answers a question the audience actually has.
- If the page is for a meeting, close with a "For this meeting" section
  listing the points to decide.
- The CDN fonts/icons need internet when the file is opened — say so; offer
  an offline version with embedded assets only if the user asks.

## When finished

1. Open it so the user sees it immediately — `open <path>` on macOS,
   `xdg-open <path>` on Linux, `start <path>` on Windows; best-effort, and
   always report the file path either way.
2. Iterate on their feedback in the SAME file (no v2 unless asked).
