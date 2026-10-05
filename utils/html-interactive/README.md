# html-interactive

**Decisions go out as a page and come back as text.**

An agent that needs ten decisions from you has two bad options: guess, or ask
ten questions one at a time. This plugin gives it a third: a local HTML page
where each decision carries its context, a recommended option and what that
option costs. You click through it, press **Copy answers**, and paste the result
into the chat. The agent reads it back by id.

The agent writes only data. A small tested kit renders the page, saves every
click, tracks progress and builds the export, so no page reinvents (or breaks)
that part.

> **Skill-based plugin.** It ships a `SKILL.md` the model follows when a page
> needs the reader to act, plus a kit: `runtime.js`, `kit.css`, `build.mjs` and
> an example. Pages that are only read belong to
> [html-deliverable](../html-deliverable/).

## What you get

- **Five controls**: choice with a recommended option, yes / no / not sure,
  score with a rubric, checkbox, free text. Every item can take a note.
- **One file that travels**: runtime, styles, data and local images inline. No
  CDN, no network, works from a mail attachment.
- **Answers that survive edits**: saved by page id + item id, so reordering,
  moving between sections and rewording titles keep them. Answers that stop
  matching are shown and exported as orphans, never dropped.
- **A copy button that does not fail silently**: clipboard, then a legacy
  fallback, then a dialog with the text selected and a `.md` download.
- **Guard rails**: clear asks first and can be undone; backup and import as
  `.json`; a visible warning when the browser is not saving; "accept
  recommended" marks what was accepted in bulk so the agent can tell.
- **An export the agent can parse**: a marker line, every item by id, pending
  ones included.

```
<!-- html-interactive v1 · page=offsite-2026 · answered=3/4 · 2026-03-02T14:10Z -->
# Answers · What is left to decide for the offsite

- `city` Which city hosts it? → **Lyon** (recommended was: Porto)
  - note: cheaper trains for the Paris group
- `week` Which week? → **Second week of March** (recommended, accepted in bulk)
- `partners` Partners at the dinner → PENDING
```

## Try it

```bash
node skills/html-interactive/kit/build.mjs skills/html-interactive/kit/example.json -o /tmp/example.html
open /tmp/example.html
```

## Using it

Ask for it in your own words — "put these decisions in an interactive HTML",
"make me a checklist page I can answer" — or let the agent reach for it when it
has several open decisions. It writes a `.json` like this and runs the build:

```json
{
  "id": "offsite-2026",
  "lang": "en",
  "title": "What is left to decide for the offsite",
  "sections": [
    {
      "id": "place",
      "title": "Place and dates",
      "items": [
        {
          "id": "city",
          "title": "Which city hosts it?",
          "context": "Porto has direct flights for 14 of the 18 people.",
          "tradeoff": "Four people need a two-hour connection.",
          "control": "choice",
          "options": ["Porto", "Lyon", "None of these"],
          "recommended": "Porto"
        }
      ]
    }
  ]
}
```

`build.mjs` validates the data (duplicate or missing ids, a recommendation that
matches no option, an image that does not exist) and refuses to overwrite an
HTML file that is not a previous build of the same page.

## Requirements

Node 18 or newer, for the build and the tests. The generated page needs only a
browser.

## Install — Claude Code

```
/plugin marketplace add chakkyy/agent-utils
/plugin install html-interactive@agent-utils
```

## Install — Codex CLI

```
codex plugin marketplace add chakkyy/agent-utils
/plugins → install html-interactive, restart the session
```

## Manual install (no plugin)

Copy `skills/html-interactive/` (the `SKILL.md` and the `kit/` folder together)
into your agent's skills directory, for example `~/.claude/skills/`.

## Tests

```bash
./tests/run-tests.sh
```

Checks the manifests, the skill frontmatter, a scrub for project-specific data,
and runs the kit's unit tests: validation, answer reconciliation, export format
and the build.

## License

[MIT](../../LICENSE)

## Layouts and brand

Three formats, picked by the shape of the decisions: `list` (the default; an item with one image per option lays them out side by side), `matrix` (a sheet, one row per decision) and `focus` (one question per screen, keys 1-9, auto-advance). Colors and type are not the layout: they come from the content's brand (`DESIGN.md`, `branding/`, `tokens.css`), then from a brand file the user keeps, then from one accent derived from the topic.
