# agent-utils

Small, focused utilities for coding agents. Each util lives in its own folder
under [`utils/`](utils/) and ships in two forms:

- **Plugin (hooks)** — for **Claude Code** and **Codex CLI**. Harness-enforced,
  runs on every prompt, deterministic. This is the robust path.
- **Skill** — for any agent that supports [Agent Skills](https://skills.sh)
  (Cursor, Amp, opencode, …). Model-invoked, portable fallback, lives under
  [`skills/`](skills/).

## Install as a plugin (Claude Code / Codex CLI — recommended)

Add the marketplace once:

```bash
# Claude Code
claude plugin marketplace add chakkyy/agent-utils

# Codex CLI
codex plugin marketplace add chakkyy/agent-utils
```

Then install whichever utils you want from inside the CLI:

```text
/plugin install time-awareness@agent-utils   (Claude Code)
/plugins → install, restart session, /hooks → trust   (Codex)
```

Each util's README has the full per-CLI instructions, verification steps and
troubleshooting.

## Install as a skill (any skills-compatible agent)

```bash
npx skills add chakkyy/agent-utils
```

The skill variant teaches the agent to read the machine clock before any
time-sensitive output. It's weaker than the hook (the model has to remember to
use it) — on Claude Code or Codex, prefer the plugin above.

## Utils

| Util | What it fixes |
| --- | --- |
| [time-awareness](utils/time-awareness/) | Long sessions where the agent still thinks it's the time the session started — "go get some rest!" at 10am. Injects the machine's current date & time into every prompt. |

Each util's README covers its options, the manual (no-plugin) install, and how
it works.

## License

[MIT](LICENSE)
