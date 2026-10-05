# Components and polish

Read before writing the body of any page: the density rules, the component recipes and the polish pass.

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
