# agent-utils

Small, focused utilities for coding agents. Each util lives in its own folder
under [`utils/`](utils/) and installs independently as a Claude Code plugin.

## Install

Add the marketplace once:

```bash
claude plugin marketplace add chakkyy/agent-utils
```

Then install whichever utils you want from inside Claude Code:

```text
/plugin install time-awareness@agent-utils
```

## Utils

| Util | What it fixes |
| --- | --- |
| [time-awareness](utils/time-awareness/) | Long sessions where the agent still thinks it's the time the session started — "go get some rest!" at 10am. Injects the machine's current date & time into every prompt. |

Each util's README covers its options, the manual (no-plugin) install, and how
it works.

## License

[MIT](LICENSE)
