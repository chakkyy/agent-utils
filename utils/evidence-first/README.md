# evidence-first

**Make the agent find the receipt before it proposes the work.**

Ask a coding agent "should we add a CI check for this?", "how do we stop this
happening again?", or "what are our gaps?" and it will answer — fluently,
confidently, and with no idea whether the problem it is solving ever happened.
The output reads like a conclusion but is a hypothesis in costume. The cost
isn't the build; it's permanently maintaining a guard that never caught
anything.

This plugin ships a skill that inverts the order: **receipt → mechanism →
solution**. Until receipts exist, the only output the agent may produce is the
search log and what it found.

> **Skill-based plugin.** No hooks. The model loads `SKILL.md` when your
> request could end in a recommendation.

## What it changes

- **A receipt has four parts, all required**: a stable identifier (ticket key,
  PR number, incident ID, permalink), a link that resolves, a **verbatim
  quote** confirming impact that actually occurred, and the causal tie written
  out. Missing any part, it goes in `CASES REJECTED` with the reason.
- **A commit titled "fix" is not an incident.** It's evidence of a *mechanism*.
  It can corroborate a receipt; it can never be the only case. The two stay
  labelled separately.
- **Where to search, ranked** — tracker, chat, hotfix/revert PRs, alerts and
  error tracking — each with the trap that makes it lie. `git log` is last, and
  flagged as the trap: it shows what was *written*, not what *hurt*.
- **Classification gate**: only a *confirmed regression* (a primary source
  documenting that something which worked stopped working, and naming the
  cause) authorises proposing work. "Never agreed", "something else" and
  "unknown cause" are reported as findings and stop there.
- **Cold search is a valid deliverable.** No qualifying case → emit
  `NO EVIDENCE`, the search log, and what to instrument. No solution section,
  no plan, no options, no next steps.
- **Pressure-resistant.** Asked to justify work anyway, the agent says so
  plainly and offers what it *can* do: search further, request access to a
  source it couldn't reach, or record the hypothesis with no recommended
  action.
- **The reverse guard.** Same standard applies to *removing* things: a control
  whose origin you can't verify is kept, reported as "origin unverifiable;
  removal blocked", and escalated as an explicit risk decision.
- **Four closed exceptions** — a settled build order, explicitly requested new
  capability, exploratory research, and an external verifiable deadline (CVE,
  regulation, advisory) whose applicability to *this* product is shown.

## The output contract

Any output containing an in-scope proposal opens with two blocks, in this
order, and contains no proposal before them:

```
SEARCH LOG
  date · window searched
  sources queried, with the filters/queries used
  sources unreachable, and why
  results per source, with links

VERIFIED EVIDENCE
  per case: identifier · link · verbatim quote · category · causal tie
  CASES REJECTED: identifier · reason
  count: N cases in M months
```

Then the shared mechanism, then the proposal sized to it, then what *not* to do
and why. Sizing is four mandatory fields: case count and window as a number,
which named case the proposal would have caught, which named case it would
**not** have caught, and the smallest version that catches the most expensive
case.

## Install — Claude Code

```bash
claude plugin marketplace add chakkyy/agent-utils
```

Then inside Claude Code:

```text
/plugin install evidence-first@agent-utils
```

**Verify:** ask *"what should we do to prevent this class of bug?"* — the agent
should load the skill (namespaced as `evidence-first:evidence-first`) and open
with a `SEARCH LOG`, not with a plan.

**Update later:** `/plugin update evidence-first@agent-utils`.

## Install — Codex CLI

The plugin ships a native `.codex-plugin/plugin.json` manifest declaring its
skills:

```bash
codex plugin marketplace add chakkyy/agent-utils
```

Then install from the `/plugins` browser (or
`codex plugin install evidence-first`) and **start a new session** — plugin
components apply on the next session. No hooks to trust: this plugin is
skills-only.

## Don't want a plugin?

Copy the skill folder into your agent's skills directory, e.g. for Claude Code:

```bash
cp -R utils/evidence-first/skills/evidence-first ~/.claude/skills/
```

⚠️ **Check for collisions first**: if you already have a personal
`~/.claude/skills/evidence-first/`, don't overwrite it. The plugin install
doesn't have this problem — plugin skills are namespaced
(`evidence-first:evidence-first`) and coexist with a personal skill of the same
name.

## Make it fire every time

The skill triggers on intent, so it fires on implicit asks too ("is it worth
it?", "what would you do?") in any language. If you want it non-optional across
a project, add a line to your `CLAUDE.md` / `AGENTS.md`:

```markdown
Any request that could end in recommending technical work loads the
`evidence-first` skill and follows it. Write the receipts before the proposal.
```

## How it works

- `skills/evidence-first/SKILL.md` carries the rule, the receipt definition,
  the source table, the classification gate, the stop conditions, the four
  closed exceptions and the output contract.
- `skills/evidence-first/PRINCIPLES.md` is the backing file: verified quotes
  with primary sources — Knuth 1974 untruncated (a measurement mandate, not an
  anti-optimisation slogan), Google SRE's postmortem trigger model, the
  Evidence-Based Management Guide, YAGNI as Fowler actually states it,
  *genchi genbutsu*, Chesterton's parable, Feynman on cargo cult, Morozov on
  solutionism. Each one is marked ✅ read at a primary source or ⚠️ secondary
  only, and a closing section lists attributions that circulate wrongly (the
  "In God we trust, all others bring data" line is **not** Deming). Conceptual
  backing is allowed only *after* local evidence is on the page — never instead
  of it.

## Tests

```bash
utils/evidence-first/tests/run-tests.sh
```

Covers: manifest parsing, Claude/Codex version sync, SKILL.md frontmatter,
PRINCIPLES.md presence and cross-link, the output-contract blocks surviving
edits, and a scrub check that no personal or project-specific data leaked into
the generic skill.

## License

MIT — see the repository root [LICENSE](../../LICENSE).
