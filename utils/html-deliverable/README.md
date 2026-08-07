# html-deliverable

**Turn "make me an HTML page" into a document people actually want to read.**

Ask a coding agent for "an HTML to present X" and you get the default:
gradient hero, glass cards, emoji bullets, five accent colors, invented
numbers. This plugin ships a skill with a **proven recipe** instead — an
invariant page structure (shell header, pill nav, evidence tables, statlines),
four selectable visual themes, and content rules that force real, verified
data.

The output is a **single-file local HTML page** you open in your browser. A
local file beats a hosted artifact for this: no CSP restrictions, CDN fonts
and icons load, and the result looks far better. (The file needs internet
when opened — fonts and icons come from CDNs.)

> **Skill-based plugin.** Unlike `time-awareness` (hook-based), this plugin
> ships a `SKILL.md` the model invokes when you ask for an HTML deliverable —
> plus a `reference.html` skeleton it clones patterns from.

## What you get

- **Invariant structure**: wordmark shell header/footer, pill navigation,
  sections with anchors, evidence as tables (caption below, right-aligned
  mono numerics), big stats in statlines, prose capped at a readable measure.
- **Four themes** — the structure never changes, the look does:

  | Theme | When |
  | --- | --- |
  | `geist` (default) | Kickoffs, plans, working docs |
  | `terminal` | Technical evidence, QA, audits, debugging |
  | `editorial` | Long-read docs, narrative proposals |
  | `bold` | Pitches, demos, anything that must land hard |

- **One accent color** (your project's brand color), semantic colors kept
  separate, and a ban list: no decorative gradients, no glass effects, no
  ALL-CAPS eyebrows, no arbitrary icons.
- **Content discipline**: numbers must be real and verified; every section
  answers a question the audience actually has; meeting pages end with a
  "For this meeting" decision list.
- **A reference skeleton** ([skills/html-deliverable/reference.html](skills/html-deliverable/reference.html))
  with all the CSS patterns ready to clone: vocabulary glossary, before/after
  panels, decision cards with a recommended option, status chips,
  asks-to-others, evidence tables, statlines. The example is one deliverable
  type (a planning explainer) — the same patterns build kickoffs, QA guides,
  comparisons, audits, post-mortems. Its data is sample/illustrative — the
  skill tells the model never to copy it into a real deliverable.

## Install — Claude Code

```bash
claude plugin marketplace add chakkyy/agent-utils
```

Then inside Claude Code:

```text
/plugin install html-deliverable@agent-utils
```

**Verify:** ask *"create an HTML page summarizing this repo for a kickoff"* —
the agent should load the skill (namespaced as
`html-deliverable:html-deliverable`) and produce a page with the shell
header, pill nav and a declared theme.

**Update later:** `/plugin update html-deliverable@agent-utils`.

## Install — Codex CLI

The plugin ships a native `.codex-plugin/plugin.json` manifest declaring its
skills:

```bash
codex plugin marketplace add chakkyy/agent-utils
```

Then install from the `/plugins` browser (or
`codex plugin install html-deliverable`) and **start a new session** — plugin
components apply on the next session. No hooks to trust: this plugin is
skills-only.

## Don't want a plugin?

Copy the skill folder into your agent's skills directory, e.g. for Claude
Code:

```bash
cp -R utils/html-deliverable/skills/html-deliverable ~/.claude/skills/
```

⚠️ **Check for collisions first**: if you already have a personal
`~/.claude/skills/html-deliverable/`, don't overwrite it — the copy above
would replace it. The plugin install doesn't have this problem: plugin skills
are namespaced (`html-deliverable:html-deliverable`) and coexist with a
personal skill of the same name.

## How it works

- `skills/html-deliverable/SKILL.md` describes the recipe: where to save,
  the invariant structure, the theme table, the ban list, and the content
  rules. Claude Code and Codex load it when your request matches its
  description ("create an HTML page to communicate/visualize something").
- `reference.html` sits next to the SKILL.md; the skill instructs the model
  to read it before writing the first page of a session and clone its CSS
  patterns (`.statline`, `.toc`, `dl.gloss`, `.ba`, `.card.dec`, `.tag`,
  `.ask`, tables, shell).
- When finished, the agent opens the file (`open` / `xdg-open` / `start`)
  and iterates on your feedback in the same file — no v2 copies.

## Tests

```bash
utils/html-deliverable/tests/run-tests.sh
```

Covers: manifest parsing, Claude/Codex version sync, SKILL.md frontmatter,
reference.html presence and basic sanity, and a scrub check that no personal
or project-specific data leaked into the generic template.

## License

MIT — see the repository root [LICENSE](../../LICENSE).
