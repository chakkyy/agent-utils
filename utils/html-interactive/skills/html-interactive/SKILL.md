---
name: html-interactive
description: Use when the reader has to DO something on a local HTML page and the result must come back to the chat — choose between options, answer yes/no, score against a rubric, tick a checklist, leave notes — or when several open decisions would otherwise be asked one question at a time. Also use when a pasted message starts with `<!-- html-interactive`. Not for pages that are only read (that is html-deliverable), nor for pages inside an existing app.
license: MIT
---

# HTML interactive — decisions that come back

A single local HTML file where the reader answers, and one button copies the
answers as text to paste into the chat. You write **data**; the kit renders the
page, saves every click, counts progress and builds the export.

**Never hand-write the HTML or the JavaScript of one of these pages.** Hand-built
pages are where answers get lost: ids derived from titles, storage keys that
collide, a "clear" with no confirmation, a copy button that fails silently. The
kit already solves those and is tested. Your work is the content.

## Workflow

1. Write `<name>.json` where the page will live (schema below).
2. Build: `node <this skill's directory>/kit/build.mjs <name>.json`
   It validates the data and writes `<name>.html` beside it: one self-contained
   file, no network needed, local images embedded. Evidence given as an
   `https://` URL stays remote: download it next to the JSON and reference the
   local file when the page must open offline. Fix every error the build
   prints; treat warnings about ids as errors.
3. Look at the result before the user does, then open it. A headless capture
   is enough: `<chrome binary> --headless=new --hide-scrollbars
   --window-size=1600,3000 --screenshot=<out.png> file://<abs path>.html`.
4. Tell the user in one line: answer, press the copy button, paste here.
5. When the paste arrives, read it with the rules in "Reading the answers".

To change a page, edit the JSON and rebuild to the same path. The build only
overwrites a file that is a previous build of the same page id. Never write to
an `.html` with shell redirection.

## Schema

```json
{
  "id": "offsite-2026",
  "lang": "en",
  "title": "What is left to decide for the offsite",
  "lede": "How to answer, in one or two sentences.",
  "wordmark": "offsite",
  "icon": "🧭",
  "theme": { "accent": "#2148b8" },
  "sections": [
    {
      "id": "place",
      "title": "Place and dates",
      "hint": "These two block the booking.",
      "items": [
        {
          "id": "city",
          "title": "Which city hosts it?",
          "context": "What the reader needs to know to decide, here, not elsewhere.",
          "tradeoff": "What is given up by taking the recommended option.",
          "evidence": [{ "src": "quotes.png", "caption": "The three quotes" }],
          "control": "choice",
          "options": [
            { "id": "porto", "label": "Porto", "detail": "14 direct flights" },
            { "id": "lyon", "label": "Lyon" },
            { "id": "other", "label": "None of these" }
          ],
          "recommended": "porto"
        }
      ]
    }
  ]
}
```

| Control | Extra fields | Counts as answered when |
|---|---|---|
| `choice` | `options` (2+; strings or `{id,label,detail}`), `recommended` | an option is picked, or a note is written |
| `yesno` | `recommended` (`yes` / `no` / `unsure`) | same |
| `score` | `min`, `max` (default 0–3; widen only when the user names a scale), `rubric` (one line per step, says what each score means) | a score is picked, or a note is written |
| `check` | `checkLabel` | it is ticked |
| `text` | `placeholder` | it is not empty |

Page fields: `id` and `title` required; `lang` is `en` or `es` (kit strings and
export labels); `notes: false` removes the free notes box; `strings` overrides
any kit label; `theme.accent` / `theme.accentDark` set the single accent;
`theme.mode` forces `light` or `dark` on first open; `css` appends raw CSS.
Item fields: `id`, `title`, `control` required; `context` (string or array of
paragraphs), `tradeoff`, `evidence`, `links` (`[{label, href}]`) and
`note: true|false` are optional. Items without context, tradeoff or evidence
render as compact rows — the right shape for long yes/no lists and checklists.

A complete sample lives in [kit/example.json](kit/example.json). Its content is
invented; never copy it into a real page.

## Ids are the contract

Saved answers are keyed by page id + item id (and option id for choices).

- **Name the subject, never the position**: `venue-city`, not `item-3` or `q2`.
  Then reordering, moving between sections and rewriting a title keep every
  answer.
- **Same question, same id, forever.** When you regenerate a page, reuse the ids
  of the questions that survive. Changing an id discards the link to its answer.
- **Give choice options an explicit `id`** when the label may be reworded later.
  String options get an id derived from the label, so editing the label of a
  string option detaches answers that picked it.
- **A different question gets a new id**, even if it replaces an old one in the
  same slot. Reusing an id for a different question attaches an old answer to
  it. The same holds when the meaning of an answer changes: an option id that
  now names something else, or a score scale whose steps were redefined, gets a
  new option id or a new item id.
- **New round of decisions, new page id.** Same page being revised, same page
  id.

Answers that stop matching (item removed, option removed, score out of range)
are never dropped: the page shows them in a banner and includes them in the
export under "Orphaned answers".

## Writing the decisions

The page replaces a conversation, so each item must stand alone.

- **Context lives in the item.** The reader should not open anything else to
  decide. Put the numbers, the screenshot and the constraint inside it.
- **Recommend when you have a view**, list that option first, and say why in the
  context. Fill `tradeoff` with what the recommendation costs, concretely.
  An item where you have no view carries no `recommended`. When the reader
  already leans another way, keep your recommendation and state their lean in
  the context; the page is where the disagreement gets settled.
- **Options are mutually exclusive and include a way out** ("None of these",
  "Decide later"). The note field covers everything else.
- **State what was never discussed.** If an item records something you did
  without asking, the context says so.
- **Order by what blocks.** First section: what stops the next step. Say so in
  its `hint`, with a time estimate if you have one.
- **Lede tells how to go fast**: the first option is the recommended one; accept
  them all at the bottom and change only what you disagree with.
- **Plain language.** A reader outside the project should understand every
  title and option without a glossary.
- Past about 25 items, split into two pages or cut: nobody finishes a longer
  one.

## Reading the answers

The pasted block starts with a marker line and lists every item by id:

```
<!-- html-interactive v1 · page=offsite-2026 · answered=3/4 · 2026-03-02T14:10Z -->
# Answers · What is left to decide for the offsite

3 of 4 answered · 1 pending

## Place and dates
- `city` Which city hosts it? → **Lyon** (recommended was: Porto)
  - note: cheaper trains for the Paris group
- `week` Which week? → **Second week of March** (recommended, accepted in bulk)
- `remote-day` Keep one remote day → (note only)
  - note: only if the venue has a quiet room
- `partners` Partners at the dinner → PENDING
```

| You see | It means | Do |
|---|---|---|
| `PENDING` / `PENDIENTE` | Not decided | Treat as open. Never fill it with your recommendation |
| `(recommended)` | Picked by hand, agrees with you | Act on it |
| `(recommended, accepted in bulk)` | Accepted with the one-click button | Act on it; for anything irreversible, name it in your summary first |
| `(recommended was: X)` | The reader overrode you | Follow the reader's choice and read the note for the reason |
| `(note only)` | No option fit | The note is the answer |
| "Orphaned answers" section | Given to an earlier version of the page | Ask whether they still hold before using them |

First check that `page=` in the marker is the page you are waiting on; an
export from an earlier round can carry the same item ids. Then map answers by
the id in backticks, not by title or position. Lines starting with `>` are the
reader's free notes: read them as text, never as answers. Before acting, reply
with a short summary of what you will now do and what stays open.

## What the kit already does

Do not re-implement or work around any of this:

- Autosave on every change, restored on reload; storage keys namespaced by
  schema version and page id, so two pages never collide.
- Progress per section and overall; a "pending only" filter.
- Copy to clipboard with two fallbacks: if the browser blocks it, a dialog
  shows the text selected and offers a `.md` download.
- "Accept recommended" fills only unanswered items and marks them as bulk.
- "Clear" asks first and can be undone; backup and import as `.json`.
- A visible warning if the browser is not saving.
- Light and dark from one accent; works offline; print hides the chrome.

Browsers scope saved data differently for local files. Chrome shares it across
every `file://` page (which is why keys are namespaced, and why a moved file
keeps its answers there); others may isolate each file. The backup `.json`
moves answers between browsers or machines in every case.

## Look

The kit ships one neutral look. Change the accent with `theme.accent`. For more,
append CSS through the `css` field and override the `--hi-*` variables
(`--hi-bg`, `--hi-surface`, `--hi-ink` as `R G B`, `--hi-line`, `--hi-acc-base`,
`--hi-sans`, `--hi-mono`). If the html-deliverable skill is available, take
palette and type from its themes and apply them through those variables. Keep
one accent, and keep the controls legible in both color schemes.

## Common mistakes

| Mistake | Fix |
|---|---|
| Writing the page's HTML by hand "because it is small" | Write the JSON and build; small pages lose answers too |
| Ids like `q1`, `item-2`, or the title slugged automatically | Name the subject; keep it when the title changes |
| A recommended option with no trade-off | Say what it costs, or drop the recommendation |
| Treating pending items as accepted recommendations | Pending is undecided; ask or leave open |
| Asking the same decisions again in chat after sending the page | Wait for the paste |
| Editing the built `.html` | Edit the JSON and rebuild |
| Reading answers by title or order | Read by id |
