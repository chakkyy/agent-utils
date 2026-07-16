# time-awareness

**Your agent always knows what time it is.**

Coding agents learn today's date **once, at session start** — and never refresh
it. Start a session at midnight, keep it alive into the next morning, and the
agent will still tell you *"go get some rest, we'll pick this up tomorrow"* at
10am, plan around "tonight", or date things to yesterday.

This plugin fixes that with a single `UserPromptSubmit` hook that injects the
machine's **current local date & time into every prompt**:

```text
Current local date & time: Wednesday 2026-07-15 11:36 -0300 -03. This is live
from the user's machine — trust it over the session start date or any earlier
timestamps in this conversation.
```

Deterministic by design: the model never has to *decide* to check the clock
(it doesn't know it's wrong about the time — that's the whole bug). The hook
runs on every prompt: no tokens spent on tool calls, no behavior to remember.

> **Plugin ≠ skill.** This plugin is *hook-based*: the harness runs it before
> every prompt, the model never participates. Skill installers (like
> `npx skills add`) will **not** install this hook — they install the
> [companion skill](../../skills/time-awareness/) instead, a portable
> model-invoked fallback for agents without hook support. On Claude Code or
> Codex, use the plugin marketplace commands below.

## Install — Claude Code

```bash
claude plugin marketplace add chakkyy/agent-utils
```

Then inside Claude Code:

```text
/plugin install time-awareness@agent-utils
```

**Verify:** ask *"what time is it?"* in a new prompt — the answer should match
your machine's clock (or run the hook directly:
`sh <plugin-dir>/hooks/inject-time.sh` prints one line of JSON).

**Update later:** `/plugin update time-awareness@agent-utils` (updates ship
when this plugin bumps its `version`, currently `1.1.0`).

## Install — Codex CLI

Codex reads this repo's marketplace through its Claude-marketplace
compatibility, and the plugin ships a native `.codex-plugin/plugin.json`
manifest:

```bash
codex plugin marketplace add chakkyy/agent-utils
```

Then, inside Codex:

1. Install the plugin from the `/plugins` browser (or
   `codex plugin install time-awareness`).
2. **Start a new session** — plugin components apply on the next session.
3. **Trust the hook**: Codex does not run plugin hooks until you review them.
   Run `/hooks`, review `inject-time.sh`, and trust it. Trust is recorded
   against the hook's hash, so a plugin update re-triggers this review — that's
   expected, review and trust again.

**Verify:** same as Claude — ask the time in a fresh prompt.

**Troubleshooting (Codex):**
- Time not injected → almost always the hook isn't trusted yet: run `/hooks`.
- Installed mid-session → restart the session.
- Still nothing → run the script by hand (path shown in `/hooks`); it prints
  JSON on success and explains itself on stderr on failure.

## Timezone

Uses the machine's system timezone — nothing to configure. To pin a different
zone (e.g. your machine is UTC but you live elsewhere), set `TIME_AWARENESS_TZ`
to an [IANA zone name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
before launching the CLI:

```bash
export TIME_AWARENESS_TZ=America/Argentina/Buenos_Aires
```

The zone is **validated against the system tzdata** before use. An unknown or
malformed value is *rejected* — the hook stays silent (diagnostic on stderr)
instead of doing what a raw `TZ` would do on macOS: silently fall back to UTC
while claiming the time is trustworthy. Unset the variable to return to the
system zone.

## Fail-open contract

The hook never blocks your prompt and never lies:

- **Success** → exactly one line of valid JSON with a complete timestamp
  (weekday, date, time, UTC offset, zone).
- **Anything wrong** (`date` missing or failing, empty/odd output, bad
  timezone) → exit 0 with **empty stdout**: nothing is injected, the prompt
  proceeds, and the reason is on stderr. An empty or wrong time asserted as
  trustworthy is worse than no time at all.

## Supported platforms

| Platform | Status |
| --- | --- |
| macOS / Linux (Claude Code & Codex) | Supported, covered by the test suite. |
| Windows + Claude Code | Works via Git Bash — Claude Code runs shell-form hooks through Git Bash on Windows by default. |
| Windows + Codex | **Not supported yet.** Codex offers a `commandWindows` override, but we don't ship a PowerShell variant we can't test. Degrades safely: the hook fails, nothing is injected, your prompt is unaffected. |

## Don't want a plugin? (Claude Code)

The whole thing is one hook. Add this to `~/.claude/settings.json` for the
same core behavior without installing anything (note: this inline version
skips the plugin's timezone validation and output checks — the plugin is the
robust path):

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "t=$(LC_ALL=C date '+%A %Y-%m-%d %H:%M %z %Z') && printf '{\"hookSpecificOutput\":{\"hookEventName\":\"UserPromptSubmit\",\"additionalContext\":\"Current local date & time: %s\"}}' \"$t\" || true",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

## How it works

- `hooks/hooks.json` registers `hooks/inject-time.sh` on the `UserPromptSubmit`
  event; both Claude Code and Codex run it before each of your prompts reaches
  the model. The command quotes `"${CLAUDE_PLUGIN_ROOT}"` so install paths with
  spaces work.
- The script prints a `hookSpecificOutput.additionalContext` JSON payload with
  the current time; the harness appends it as context to your prompt.
- One `date(1)` call captures weekday, date, time, offset and zone from the
  same instant — no minute/DST tearing between two calls.
- Zero runtime dependencies: POSIX sh + `date`. The output character set is
  validated before printing, so the payload is JSON-safe without an escaper.

## Tests

```bash
utils/time-awareness/tests/run-tests.sh
```

Covers: happy path, install paths with spaces/quotes/unicode, valid & invalid
& malicious `TIME_AWARENESS_TZ` values, missing/failing/garbage `date`,
single-instant capture, JSON validity, empty-stdout fail-open, executable bit,
manifest parsing and version sync, and speed. Set `TIME_AWARENESS_SMOKE=1` to
also run a real end-to-end smoke test against the `claude` CLI.

## FAQ

**Does this break prompt caching?** No. The timestamp is appended alongside the
*new* user message, so the cached prefix of the conversation stays intact.

**Why not a skill?** Skills are model-invoked: the agent has to realize it
needs one. An agent that's wrong about the time doesn't know it's wrong — so it
would never invoke it. Hooks are harness-enforced and run every time. That
said, the repo ships a [companion skill](../../skills/time-awareness/)
(`npx skills add chakkyy/agent-utils`) as a portable fallback for agents that
support skills but not hooks; it nudges the model to read the machine clock
before time-sensitive output, and points back to this plugin as the upgrade.
