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
- Voice: precise, calm, no hype; sentence case; write in the user's language.
  **Product language everywhere**: labels of flows, steps and tags name the
  effect on the product/user ("the new site is already live", never "flip
  URL_ADMIN"); infra terms and commands get translated or moved into a
  `<details>`. The test: a PM reads any component without asking what a step
  means — if they'd ask, the label is wrong.
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

Match the theme to what the content IS: an analysis that argues with numbers, a
postmortem, and a pitch are different documents and should look different.
Six themes; don't repeat the same look twice in a row unless the page belongs
to a series.

| Theme | When | Recipe |
|---|---|---|
| `apple` (default) | Kickoffs, plans, working docs, pitches, demos | Geist Sans + Geist Mono · white `#fff`, ink `#171717`, borders `#eaeaea` · **display dial**: working docs at weight 600 / ~2.5rem display; pitches at 800 / 3.5rem+ with huge stats and a more present accent |
| `swiss` | Analyses, comparisons, audits — pages that argue with numbers | Light stone canvas `#fafaf9` · hierarchy by **opacity of one ink** (100 / 70 / 45%), never a second gray ramp · headings weight 300–400, never bold · strict 8px grid, radius 0–4px · accent at 10–60% opacity, full strength only on the verdict |
| `terminal` | QA, debugging, live technical evidence | Dark `#0d1117`, ink `#e6edf3`, mono as protagonist (Geist Mono or JetBrains Mono), bright brand accent · **bimodal density**: dense mono metadata blocks beside generous empty space · `[ SECTION ]` bracket labels allowed here only |
| `industrial` | Postmortems, incidents, ops/security material | Newsprint `#f4f4f0`, monolithic sans, ONE hazard accent (red family) · zero border-radius, visible 1–2px dividers · facts live in `dl`/`data`/`kbd`, not prose |
| `editorial` | Long-read docs, narrative proposals | Characterful serif for display ONLY (Newsreader/Fraunces) + sans body · warm bone paper `#f7f6f3`, off-black ink (never `#000`) · 1px `#eaeaea` borders, washed pastel tags · more leading |
| `print` | Personal reports, research digests, retrospectives, insights — pages where a memorable identity beats reading speed | Two-ink editorial print, adapted from the mono-color skill (github.com/yanliudesign/mono-color-skill) · neutral paper substrate + exactly TWO inks: dominant (~80%) carries text, rules and halftone screens; accent (~20%) carries section numerals, ONE key stat, alerts · zero radius, no cards, no shadows — ruled rows and hairlines only · bar fills are halftone dot screens; hero = one screened object crossed by an oversized display word (registration-drift echo as the one imperfection) · uppercase mono microcopy and numbered section headers allowed here only · ONE manual gesture max (hand-drawn circle around one number) · dark toggle = negative plate (swap paper/ink) |

**`print` recipes** — three validated ink/type/layout combos; **A is the default**,
pick B or C only when the content leans that way:

- **A poster** (default): Cool Gray `#E9E9E5` · Charcoal `#30343A` + Signal Red
  `#C83232` · layout "ruled information poster" (halftone disc crossed by the
  headline, ruled metadata band, date subordinate) · Archivo + IBM Plex Mono.
- **B one-ink**: Neutral White `#FAFAF7` · Cobalt `#2148B8` alone — everything
  is one ink; drift renders as a pale second impression · layout "type-led
  declaration" (stacked two-line headline owns the page, small screened object
  grounds it) · Archivo at 125% width.
- **C journal**: Pale Beige `#F5F1E8` · Oxblood `#6E2A2A` text + Botanical Green
  `#008A4B` graphics · layout "editorial journal" (serif italic lowercase title,
  framed halftone plate with mono caption, reading columns) · Fraunces + mono.

Build the halftone hero as an inline SVG dot grid (dot radius grows with distance
from a highlight point, clipped to the shape); bar fills reuse the screen as a
`radial-gradient` dot pattern.

**Register dials, not themes** — two operations on top of any theme: `quieter`
(desaturate 70–85%, drop each weight one step, flatten shadows — the default
register for stakeholder docs) and `bolder` (amplify ONE named section — the
headline finding — with the theme's own scale at full strength while the
neighbors recede; five bolded things is flat, not bold).

A custom theme is valid when the subject calls for it (e.g. a dark-mode QA
review shown in dark) — keep the invariant structure, the Apple base and the
single-accent discipline. Agency-landing maximalism (glass cards, glowing
orbs, double-bezel buttons) stays out of every theme: these pages optimize
for scan speed, not "$150k feel".

## Density: build an infographic, not a report

The reader scans before reading, and mostly does not switch to reading. A
section that only works when read start to finish has failed, however well
written it is.

**Default to the visual form.** Reach for prose only when no other form
carries the meaning:

| What you have | What it becomes |
|---|---|
| Counts, totals, "N in M months" | Statline / one big number where the adjective was |
| Two or more things compared on the same axes | Table |
| "X is Y" facts: metrics, versions, owners, dates | Key-value grid (`dl.kv`), never sentences |
| An ordered procedure | Numbered steps, one action each |
| A sequence in time (cutover, incident, release) | Timeline |
| A pipeline with stages | Flow: labeled boxes with arrows |
| A proportion, split or budget | Meter / bar row |
| Evidence from a source | Blockquote + `cite`, or claim + source chip |
| Parallel alternatives, limits, caveats | Cards |
| A state ("blocked", "stopped", "confirmed") | Tag/badge, not an adjective in a sentence |
| Q&A, decision log, objections | Divider list: `border-bottom` rows, no cards |
| A rejected option and why | One table row: option · number that kills it |
| A verdict | The verdict box, once, at the end of its section |

**Budgets, checked before publishing:**

- A prose block runs to 3 sentences. At 4, it was a table.
- Cut every sentence in half, then do it again; what survives is the page.
- A table cell holds a fragment, ≤ 12 words. A cell with two sentences is a
  paragraph hiding in a table — rebuild it as claim + source chip, with the
  long version in a `<details>` if it must exist.
- A section carries ~120 words of prose total, outside tables and captions.
- One screenful holds one idea and one visual.
- A heading never gets restated by its first line: if the heading says it,
  the first line adds new information or disappears.
- **The 60-second rule:** the verdict and its three strongest supports must be
  reachable by scrolling and reading only components — no paragraph on the
  critical path.

**Say each fact once, in its strongest form.** A number in the statline never
reappears in a paragraph; a framing sentence lives in one place. Repetition
reads as padding and trains the reader to skim past things that matter.

**The scan test, run before opening:** cover every paragraph and read only the
headings, tables, statlines and blockquotes. If the argument survives, publish.
If it collapses, the argument was hiding in prose and belongs in the visuals.

Section subtitles earn their line by saying what the section proves, not by
introducing it. "Four cases, one mechanism" works; "In this section we look at
the cases" is a line the reader pays for and gets nothing from.

## Component recipes

The vocabulary that replaces prose. Each entry: when it wins, then the
structural essence (adapt to the theme's variables; full implementations
accumulate in the reference skeleton).

- **Statline / big number** — totals and headline metrics. Oversized digits
  (mono, `tabular-nums`, tight tracking) with a small muted caption below;
  cells divided by hairlines.
- **Key-value grid** (`dl.kv`) — specs, owners, dates, versions. `dl` in a
  2-col grid: `dt` small mono muted, `dd` normal; one hairline between rows.
  Kills every "the X is Y, and the Z is W" sentence.
- **Timeline** — anything that happens in order over time. Left `2px` rule,
  a dot per event, date in small mono, one-fragment label; phase changes get
  the accent dot.
- **Flow** — pipelines and cutovers. Inline-flex boxes joined by `→` in the
  faint color; the risky stage carries a tag, not an explanation.
- **Meter / bar row** — splits, budgets, progress, effort. Label + thin track
  (`height: 6-8px`) + fill in accent; value at the right in mono. Three bars
  replace a paragraph of proportions.
- **Tag / badge** — states. Small mono pill, one muted tint per status FAMILY
  (ok/warn/err/neutral), text + border in the family color.
- **Callout** — one warning or instruction. Three lines max: what · why (only
  if it changes behavior) · what to do next. A callout with a fourth line is a
  section.
- **Divider list** — Q&A, decision logs, FAQs, objections. Rows separated by
  `border-bottom` only; question/label bold or mono, answer muted. No boxes.
- **Claim + source chip** — evidence tables. The cell states the claim in ≤ 12
  words; the source is a linked chip (`file:line`, PR, dashboard) beside or
  below it; the verbatim quote lives in a `<details>` when it matters.
- **Before / after** (`.ba`) — any "today vs proposed". Two labeled columns,
  same axes, differences carry the accent.
- **Verdict box** — the one conclusion. Accent-tinted background, 2-3
  sentences, once per page (or once per major section in long audits).
- **Container lines** (optional device, max one per page) — `1px` hairlines at
  the content edges with tiny corner squares, `pointer-events: none`, behind
  content. Frames the page as a measured object; counts as the page's one
  background device.
- **`kbd`** — literal commands and shortcuts. `1px` border, `4px` radius,
  mono, faint tint; show the token instead of describing it.

## Design taste (polish pass before opening the file)

The details that separate a designed page from a default-looking one:

- **Hierarchy from size + weight, not color.** One display size for the page
  title, one for section headers, body at 15–16px. If everything is bold,
  nothing is. For text shades, prefer opacity steps of one ink (100 / 70 /
  45%) over a second gray ramp.
- **Spacing on a scale** (4/8-based) and whitespace does the grouping: the gap
  between groups is at least 2× the gap inside a group, and each nesting level
  gets ~1.4× the spacing of its child. Order of tools: space first, background
  tint second, divider line last — a line only where space alone can't carry
  the structure.
- **`color-scheme` synced to the theme** (`light dark` on `:root`, flipped with
  the toggle) so native scrollbars and form controls match; every interactive
  element keeps a visible `:focus-visible` ring — never bare `outline: none`.
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

### Hierarchy — the tiers pass (index and hub pages especially)

A page that shows every item at the same size has no hierarchy, however
polished each card is. Before styling, sort the content into tiers and give
each tier its own component; a screenful should read in one glance as "these
two or three matter, the rest is here if you need it".

| Tier | What goes there | Component |
|---|---|---|
| 1 · the things opened every day | 2–3 items, never more | **Hero cards**: large title (1.4–1.6rem, weight 700), one-line purpose, a "Open →" call to action, min-height so they read as a band |
| 2 · reached often | 4–6 items | **Cards**: normal title, one line, path in mono, state chip |
| 3 · reached sometimes | any number | **Divider rows**: name + one line on the left, chip + date + arrow on the right; `border-bottom` only, no boxes |
| 4 · archive and mechanics | the rest | **Collapsed `details`** with a `+`/`−` summary; regeneration commands live inside |

Rules that make the tiers hold:

- **Display `h1`** for the page: `clamp(2.2rem, 4.5vw, 3.4rem)`, weight 800,
  tracking `-0.035em`, line-height 1.02, a short lede under it in muted ink.
  The section headers stay at 1.2rem so the tier-1 card titles outrank them.
- **Section header as one line**: `h2` and its hint side by side
  (`display:flex; align-items:baseline`), not stacked; the section's content
  is the hierarchy, not the heading.
- **Motion that reveals structure**: items enter with a staggered rise
  (`opacity 0→1`, `translateY(10px)→0`, ~0.5s ease-out, `45ms × index` delay
  via a `--i` custom property); hover lifts a card 2–3px, draws a 3px accent
  line along its top edge (`::before` with `transform: scaleX(0→1)` from the
  left), and nudges the arrow glyph `translateX(3px)`; a row shifts its
  left padding instead of lifting. `:active` scales to `.99`. All of it off
  under `prefers-reduced-motion`; animate only `transform`/`opacity`.
- **Relative dates** on anything living (`hoy`, `hace 3 d`, then the ISO
  date past 30 days), read from the file's mtime, so freshness is visible
  without a "last updated" sentence.
- **Emoji as glyph, not decoration**: one per tier-1 card, inside the title,
  chosen to identify the page in a tab strip; none on tiers 2–4.
- **Dot grid as the one background device** (`radial-gradient` at ~6% ink,
  24px cell, theme-aware), so the tiers float on a measured surface instead
  of a flat wall.


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
