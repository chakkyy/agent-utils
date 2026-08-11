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

The STRUCTURE is always the same. The STYLE varies by theme: don't repeat the
same look twice in a row — pick per audience and purpose (or whichever the user
names).

### Invariant (every theme)

- Header shell (project wordmark left, mono metadata right) · pill nav with
  anchors when there are 4+ sections · sections with `scroll-margin-top` ·
  footer mirroring the wordmark.
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

### Themes (pick one, declare it in a comment in the `<head>`)

| Theme | When | Recipe |
|---|---|---|
| `geist` (default) | Kickoffs, plans, working docs | Geist Sans + Geist Mono · white `#fff`, ink `#171717`, borders `#eaeaea` · light |
| `terminal` | Technical evidence, QA, audits, debugging | Dark background `#0d1117`, ink `#e6edf3`, mono as protagonist (Geist Mono or JetBrains Mono), bright brand accent |
| `editorial` | Long-read docs, narrative proposals | Characterful serif for display (e.g. Newsreader/Fraunces) + sans for body · slightly warm paper · more leading |
| `bold` | Pitches, demos, anything that must land hard | Geist at weight 800, giant display, more present accent, huge stats |

A custom theme is valid when the subject calls for it (e.g. a dark-mode QA
review shown in dark) — keep the invariant structure and the single-accent
discipline.

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
