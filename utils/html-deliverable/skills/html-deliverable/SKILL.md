---
name: html-deliverable
description: Build a polished single-file local HTML page to communicate or visualize something — project kickoffs, QA guides, meeting material, comparisons, evidence, explanations of a topic. Use when the user asks to "create an HTML" for one of those, or wants a better way to present a document than plain text. Do NOT use for pages inside an existing app or website, for standalone diagrams, or when the user explicitly asks for another format (Artifact, slides, markdown).
license: MIT
---

# HTML deliverable

One self-contained local HTML file, opened in the browser when done. A local file beats a hosted artifact (no CSP, CDN fonts work); host it only when the user asks for a URL.
If the reader has to decide, score or tick and the result must come back to the chat, use `html-interactive` instead.

## Steps

1. **Receipts.** If the page carries data, numbers or a recommendation, every claim links its source and the evidence comes before the proposal. It gets its own section only when the reader audits (QA, postmortems, reviews); otherwise sources ride as chips beside the claims.
2. **Brand.** Resolve it (section below).
3. **Theme.** Pick one from the table by what the content IS; read only its recipe in [themes.md](themes.md). When the user is present, ask once with your recommendation first; otherwise decide. Declare it in a `<head>` comment.
4. **Build** the invariant structure with components, following [components.md](components.md). Clone the patterns of [reference.html](reference.html). Slides: [slides.md](slides.md). Explaining an outside source: [explainers.md](explainers.md).
5. **Prose.** Plain, precise, sentence case, zero em or en dashes. Run a humanizer pass if one is available.
6. **Open** it, then iterate on the same file.

## Brand

Colors and type come from the brand of the content. Stop at the first hit:
1. The content's brand: `DESIGN.md`, `branding/`, `tokens.css` or a brand guide in the project or brief. Its accent and fonts replace the theme's; the theme keeps format and surfaces.
2. A brand file the user keeps, if any (for example `~/.claude/brand.md`).
3. The theme's own palette.

## Themes

| Theme | When |
|---|---|
| `base` | Kickoffs, plans, working docs, pitches. The default |
| `editorial` | Long reads, narrative proposals; muted and calm |
| `print` | Personal reports, digests, retros, postmortems; memorable identity |
| `tablero` | Dashboards, status, metrics, live technical evidence. Dark |
| `tecnico` | Dev guides, QA, setup docs, technical reviews |
| `changelog` | Proposing or announcing a change to a tool, rule or process |
| `organic` | Chill pages read often: dailies, trackers, notes to friends |
| `joy` | Trips, events, celebrations |

Do not repeat the previous page's theme unless the pages are a series. Two dials apply on top of any theme: **quieter** (desaturate, drop weights a step; default for stakeholder docs) and **bolder** (one named section at full strength).

## Invariant structure

- Header shell: wordmark left, mono metadata and a light/dark toggle right. Sticky, translucent (blur + saturate), solid under `prefers-reduced-transparency` and `prefers-contrast: more`. Pill nav with anchors at 4+ sections; `scroll-margin-top` on sections; footer mirrors the wordmark.
- Toggle follows `prefers-color-scheme`, persists in `localStorage`, re-declares the CSS variables under `html[data-theme="dark"]`. Locked themes (tablero, changelog, joy) skip it.
- Apple base: display type large and tight (-0.02 to -0.035em, line-height 1.02-1.1), body 15-16px at 1.5-1.65, concentric radii, thin borders over shadows, font stacks ending in `system-ui`.
- One accent with meaning, always beside a non-color signal; semantic colors stay separate. Content-related favicon.
- Only the page `h1` is a thesis sentence with one accent phrase; section titles are short labels.

## Content

- Real data, verified; say exactly what a number measures and out of what total.
- Everything with a URL is a link; never invent one.
- Every section answers a question the reader has. A meeting page closes with the points to decide.
- Product language in labels: name the effect on the user, move infra terms into a `<details>`.
- Save where the user says; otherwise the project's workspace root, never inside a git repo unless asked.
