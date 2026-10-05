---
name: html-interactive
description: Use when the reader has to DO something on a local HTML page and the result must come back to the chat — choose between options, answer yes/no, score against a rubric, tick a checklist, leave notes — or when several open decisions would otherwise be asked one question at a time. Also use when a pasted message starts with `<!-- html-interactive`. Not for pages that are only read (that is html-deliverable), nor for pages inside an existing app.
license: MIT
---

# HTML interactive — decisions that come back

One local HTML page where the reader answers and one button copies the answers back to the chat. You write **data**; the kit renders, autosaves, counts progress and builds the export. The kit is the only way to make these pages: hand-built pages lose answers.

## Steps

1. Write `<name>.json` where the page will live (schema below). Pick the **layout** and resolve the **brand** first (sections below).
2. Build: `node <this skill's directory>/kit/build.mjs <name>.json` → `<name>.html` beside it, self-contained, local images embedded. Done when the build prints no errors and no id warnings.
3. Open it and tell the user in one line: answer, press copy, paste here.
4. When a paste starting with `<!-- html-interactive` arrives, read it with [reading-answers.md](reading-answers.md) before acting.

To change a page, edit the JSON and rebuild to the same path.

## Schema

```json
{
  "id": "offsite-2026", "lang": "es", "title": "Qué falta decidir del offsite",
  "lede": "La primera opción es la recomendada; aceptá todas abajo y cambiá solo las que no.",
  "layout": "list",
  "theme": { "accent": "#2148b8", "fonts": { "sans": "\"Geist\"", "href": "https://fonts.googleapis.com/css2?family=Geist:wght@400;600&display=swap" } },
  "sections": [{ "id": "place", "title": "Lugar", "hint": "Bloquea la reserva.", "items": [{
    "id": "city", "title": "¿Qué ciudad?", "context": "14 de 18 vuelan directo a Porto.",
    "tradeoff": "4 personas hacen escala de 2 h.", "evidence": [{ "src": "quotes.png", "caption": "Cotizaciones" }],
    "control": "choice", "options": [{ "id": "porto", "label": "Porto", "detail": "venue 2.100/día" }, { "id": "other", "label": "Ninguna" }],
    "recommended": "porto" }] }]
}
```

| Control | Extra fields | Answered when |
|---|---|---|
| `choice` | `options` (2+, strings or `{id,label,detail}`), `recommended` | an option is picked or a note written |
| `yesno` | `recommended` (`yes` / `no` / `unsure`) | same |
| `score` | `min`, `max` (default 0-3), `rubric` (one line per step) | same |
| `check` | `checkLabel` | ticked |
| `text` | `placeholder` | not empty |

Optional page fields: `lang` (`en`/`es`), `notes: false`, `strings` (override kit labels), `css` (appended CSS). Optional item fields: `context` (string or paragraphs), `tradeoff`, `evidence`, `links` (`[{label, href}]`), `note`. Sample: [kit/example.json](kit/example.json) (invented content).

## Ids are the contract

Answers are saved by page id + item id + option id.
- Name the subject (`venue-city`), never the position (`q2`).
- A surviving question keeps its id forever; a different question, or an answer whose meaning changed, gets a new id.
- Give options explicit ids when labels may change.
- New round of decisions, new page id.

## Writing the decisions

Each item stands alone, because the page replaces a conversation.
- Context lives in the item: the number, the screenshot, the constraint. Two short lines; the rest goes in option `detail`.
- Recommend when you have a view: that option first, why in the context, its cost in `tradeoff`. No view, no `recommended`.
- Options are exclusive and include a way out ("Ninguna", "Decidir después").
- Order by what blocks; the first section's `hint` says what it unblocks.
- Plain language a reader outside the project understands. Past ~25 items, split the page.

## Layout

The layout is the format: pick it from the shape of the decisions.

| `layout` | Format | Use when |
|---|---|---|
| `list` (default) | Question left, options right as clear radio cards. An item whose `evidence` count equals its option count shows images in a row with the options aligned under them | Most pages; choosing between designs or images |
| `matrix` | A sheet: one row per item, options as cells, note at the end, context clamped to 2 lines | Many similar decisions with the same kind of options, triage, theme or vendor lists |
| `focus` | One question per screen, big numbered targets, keys 1-9 pick and auto-advance, ←/→ move, dots show progress | Few decisions that deserve full attention, or readers who are not technical |

`section.layout` can be `list` or `matrix`, to mix a sheet with regular items on one page.

## Brand

Colors and type come from the brand of the content, never from the layout. Resolve in this order and stop at the first hit:
1. The content's brand: a `DESIGN.md`, `branding/` folder, `tokens.css` or brand guide in the project or the brief.
2. The user's brand file, if one exists (`~/.claude/brand.md`).
3. Derive from the content: one accent that fits the topic over neutral surfaces, different from the previous page's.

Map it to `theme`: `accent` (`accentDark` optional), `light` / `dark` surfaces `{bg, surface, ink, line}` as hex, `fonts` `{sans, mono, display, href}` with `href` a Google Fonts URL, `mode` to force `light` or `dark`. One accent; controls legible in both schemes.
