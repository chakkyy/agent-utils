# agent-utils

Small, focused utilities for coding agents. Each util lives in its own folder
under [`utils/`](utils/) and installs independently as a plugin for **Claude
Code** and **Codex CLI**. These are hook-based plugins, not skills — install
them with the plugin marketplace commands below, not with skill installers.

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

Each util's README covers its options, the manual (no-plugin) install, and how
it works.

## License

[MIT](LICENSE)
