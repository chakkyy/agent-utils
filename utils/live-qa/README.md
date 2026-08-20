# live-qa

**Verdicts come from rendered screens in a real session — never from green suites or code reading.**

Ask an agent "does this feature work on staging?" and it will read the code, run
the unit suite, and answer "yes" — without ever opening the app. This plugin
ships a skill that forces the honest version: a real authenticated browser
session against the deployed environment, one verdict per case
(`PASS / FAIL / NOT_EXECUTABLE / INCONCLUSIVE`), each backed by a screenshot,
URL, captured API response, or exact rendered copy. No session available?
The run stops at the literal blocker **"NO USER TO TEST WITH"** instead of
falling back to code reading and calling it tested.

## What's inside

- `skills/live-qa/SKILL.md` — the run protocol: secure a session, boot the
  harness, split cases into parallel read-only batteries plus one final mutating
  battery, adjudicate everything with evidence.
- `skills/live-qa/kit-template.mjs` — Playwright harness starter with the
  hard-won parts already solved: bot masking (`navigator.webdriver`, UA,
  `userAgentData.brands`), service-worker blocking, auth-token injection,
  API capture. Per-app spots are marked `EDIT PER APP` and fed by
  `QA_TARGET` / `QA_TOKEN` / `QA_API_MARKER` env vars.

The skill also carries seven field-proven traps (skeleton screenshots reading as
false FAILs, loose text selectors clicking look-alike controls, hash routers
needing a reload after token writes, …) so no run re-derives them.

## Requirements

- Node with [Playwright](https://playwright.dev) available in the project or
  globally (`npx playwright install chromium`).
- Test credentials for the target environment, supplied via env vars or a
  gitignored local file — the skill refuses to run without a real session.

## Install

```
/plugin marketplace add chakkyy/agent-utils
/plugin install live-qa@agent-utils
```
