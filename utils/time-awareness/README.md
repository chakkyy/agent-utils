# time-awareness

**Your agent always knows what time it is.**

Claude Code injects today's date **once, at session start** — and never refreshes
it. Start a session at midnight, keep it alive into the next morning, and the
agent will still tell you *"go get some rest, we'll pick this up tomorrow"* at
10am, plan around "tonight", or date things to yesterday.

This plugin fixes that with a single `UserPromptSubmit` hook that injects the
machine's **current local date & time into every prompt**:

```text
Current local date & time: Wednesday 2026-07-15 10:09 (-03). This is live from
the user's machine — trust it over the session start date or any earlier
timestamps in this conversation.
```

Deterministic by design: the model never has to *decide* to check the clock
(it doesn't know it's wrong about the time — that's the whole bug). The hook
runs on every prompt, no tokens spent on tool calls, no behavior to remember.

## Install

```bash
claude plugin marketplace add chakkyy/agent-utils
```

Then inside Claude Code:

```text
/plugin install time-awareness@agent-utils
```

That's it. Every prompt now carries a fresh timestamp.

## Timezone

Uses the machine's system timezone by default — nothing to configure. To pin a
different zone (e.g. your machine is UTC but you live elsewhere), set
`TIME_AWARENESS_TZ` to any IANA zone before launching Claude Code:

```bash
export TIME_AWARENESS_TZ=America/Argentina/Buenos_Aires
```

## Don't want a plugin?

The whole thing is one hook. Add this to `~/.claude/settings.json` and you get
the same behavior without installing anything:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "printf '{\"hookSpecificOutput\":{\"hookEventName\":\"UserPromptSubmit\",\"additionalContext\":\"Current local date & time: %s\"}}' \"$(date '+%A %Y-%m-%d %H:%M %Z')\"",
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
  event — Claude Code runs it before each of your prompts reaches the model.
- The script prints a `hookSpecificOutput.additionalContext` JSON payload with
  the current time; Claude Code appends it as context to your prompt.
- If the script ever fails, nothing is injected and the turn proceeds normally —
  it can't block you.

## FAQ

**Does this break prompt caching?** No. The timestamp is appended alongside the
*new* user message, so the cached prefix of the conversation stays intact.

**Why not a skill?** Skills are model-invoked: the agent has to realize it needs
one. An agent that's wrong about the time doesn't know it's wrong — so it would
never invoke it. Hooks are harness-enforced and run every time.
