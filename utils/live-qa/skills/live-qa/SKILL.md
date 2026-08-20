---
name: live-qa
description: Live QA — drive a deployed environment in a real logged-in browser session and adjudicate each case from what renders, screenshot as evidence. Fires on "live QA" / "QA en vivo", and on any ask to confirm a feature actually works on a preview or staging ("test it for real").
---

# Live QA

A verdict here comes from a rendered screen in a real session. The suite going green and the code
reading correct are different, weaker claims — report them as what they are, never as "tested".

## The run

1. **Secure a session.** A real user, authenticated against the target environment, landing
   screenshot taken. If no user/credentials/environment path exists, output the literal blocker —
   **"NO USER TO TEST WITH"** — as the first line and stop; getting the session is the
   human's step, not something to work around with code reading.
2. **Boot the harness.** Start from `kit-template.mjs` in this folder (Playwright; auth injection,
   service-worker blocking, bot masking, API capture already solved — see Traps). Fill in the
   `QA_TARGET` env var and the per-app markers flagged `EDIT PER APP`. Smoke it: authenticated
   landing + one API 200 before any case runs.
3. **Run the batteries.** Split cases into read-only batteries (navigation, states, layouts,
   viewports — safe to fan out across parallel agents) and one **mutating battery** (completions,
   submissions, anything that writes) that runs last and alone: mutations destroy the clean state
   the read-only batteries assume. A battery is done when every assigned case is adjudicated.
4. **Report.** One line per case: `CASE: PASS / FAIL / NOT_EXECUTABLE / INCONCLUSIVE — evidence`.
   Done when every case in the brief carries a verdict with evidence, and every `pageerror` seen
   anywhere is listed verbatim — including on green runs.

## Verdicts and evidence

- **Evidence** = screenshot filename, URL, captured API response, or exact rendered copy. A
  case without evidence is not adjudicated.
- **NOT_EXECUTABLE** carries the technical reason and, when one exists, the short human step that
  unblocks it (e.g. "watch the intro video once, then automation resumes").
- **INCONCLUSIVE** is for evidence that permits two readings — say what extra observation would
  settle it.

## Traps (proven in real staging runs)

Solved in `kit-template.mjs`; listed so nobody re-derives them:

1. Tracking and bot-detection scripts drop automation traffic — mask `navigator.webdriver`, the
   user agent, AND `navigator.userAgentData.brands` (HeadlessChrome hides there).
2. Service workers swallow network from Playwright's listeners — create contexts with
   `serviceWorkers: 'block'`.
3. Hash routers re-read localStorage only on document load — after writing tokens or flags,
   `page.reload()`.
4. Select buttons with `getByRole('button', { name, exact: true })` — a loose `has-text("Back")`
   can match "Back To The Previous Version" and silently change app state.
5. Staging is slow — waitForSelector at 25s plus a settle after navigation; a screenshot taken
   early shows a skeleton and reads as a false FAIL.
6. Synthetic video control (seek-to-end, 16x) reaches the player iframe but the app's
   `onEnded` may stay silent — video-gated flows are NOT_EXECUTABLE with a real-watch human step.
7. Adjudicate an app-state change from the URL plus a screenshot, both taken after the click —
   the click that "did nothing" may have hit a look-alike control (see trap 4).

## Entry recipes per app

Each app needs an entry recipe before its first run: test users, how auth works (magic link, OTP,
password), where the session token lives (e.g. `localStorage.accessToken`), and any environment
quirks. Keep it in that app's own repo or docs hub — never in this skill. If none exists, find or
write one before improvising an entry path; credentials belong in a gitignored local file or env
vars, never in the recipe.
