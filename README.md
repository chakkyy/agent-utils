# agent-utils

Small, focused utilities for coding agents. Each util lives in its own folder
under [`utils/`](utils/) and installs independently as a plugin for **Claude
Code** and **Codex CLI**. Some utils are hook-based, some are skill-based —
each util's README says which. Either way, install them with the plugin
marketplace commands below.

## Install

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

## Utils

| Util | What it fixes |
| --- | --- |
| [time-awareness](utils/time-awareness/) | Long sessions where the agent still thinks it's the time the session started — "go get some rest!" at 10am. Injects the machine's current date & time into every prompt. |
| [html-deliverable](utils/html-deliverable/) | "Make me an HTML page" producing gradient-and-glass slop with invented numbers. A skill with a proven recipe: invariant structure, four themes, one accent color, real data only. |
| [evidence-first](utils/evidence-first/) | Confident proposals for problems nobody has. The agent must produce a receipt — identifier, resolving link, verbatim quote, causal tie — before recommending any guard, CI check, migration or refactor, or emit `NO EVIDENCE` and stop. |

Each util's README covers its options, the manual (no-plugin) install, and how
it works.

## License

[MIT](LICENSE)
