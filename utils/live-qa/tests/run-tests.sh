#!/bin/sh
# Test suite for the live-qa skill plugin. POSIX sh; needs python3 (manifest
# checks) and node 18+ (the kit's unit tests).
# Run from anywhere: ./tests/run-tests.sh
#
# Contract under test:
#   - manifests parse and stay in sync (claude version == codex version)
#   - the skill keeps its verdict vocabulary and the missing-session stop
#   - the skill, the kit, the tests and the README carry no data from anyone's
#     own environment
#   - the kit template wires the browser, session and API capture as documented,
#     checked against a fake Playwright boundary (no browser, no deployed app)
set -u

TESTS_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PLUGIN_DIR=$(dirname -- "$TESTS_DIR")
REPO_DIR=$(dirname -- "$(dirname -- "$PLUGIN_DIR")")
SKILL_DIR="$PLUGIN_DIR/skills/live-qa"

pass=0
fail=0

ok()   { pass=$((pass + 1)); printf 'ok   - %s\n' "$1"; }
bad()  { fail=$((fail + 1)); printf 'FAIL - %s\n' "$1"; }

# ----------------------------------------------------------------- manifests
for m in "$PLUGIN_DIR/.claude-plugin/plugin.json" "$PLUGIN_DIR/.codex-plugin/plugin.json"; do
  if python3 -m json.tool "$m" >/dev/null 2>&1; then ok "manifest parses: ${m#"$REPO_DIR"/}"; else bad "manifest parses: $m"; fi
done

if python3 - "$PLUGIN_DIR" <<'PY'
import json, sys
d = sys.argv[1]
a = json.load(open(d + "/.claude-plugin/plugin.json"))
b = json.load(open(d + "/.codex-plugin/plugin.json"))
assert a["name"] == b["name"] == "live-qa"
assert a["version"] == b["version"]
assert b["skills"] == "./skills/"
PY
then ok "manifests agree on name and version; codex declares skills"; else bad "manifests disagree or codex does not declare skills"; fi

# --------------------------------------------------------------------- skill
for word in PASS FAIL NOT_EXECUTABLE INCONCLUSIVE 'NO USER TO TEST WITH'; do
  if grep -q "$word" "$SKILL_DIR/SKILL.md"; then ok "skill keeps: $word"; else bad "skill lost: $word"; fi
done

# ----------------------------------------------------------- generic content
if LEAKS=$(sh "$REPO_DIR/tests/scrub.sh" "$PLUGIN_DIR" "$SKILL_DIR" "$PLUGIN_DIR/README.md" "$TESTS_DIR" 2>&1); then
  ok "no environment data in skill content, kit, tests or README"
else
  bad "environment data in the generic skill:
$LEAKS"
fi

# ----------------------------------------------------------------- kit tests
if command -v node >/dev/null 2>&1; then
  if KIT_OUT=$(node --test --test-reporter=tap "$TESTS_DIR/kit.test.mjs" 2>&1); then
    ok "kit unit tests ($(printf '%s\n' "$KIT_OUT" | sed -n 's/^# pass //p') passed)"
  else
    bad "kit unit tests failed:
$(printf '%s\n' "$KIT_OUT" | grep -E '^not ok|error:' | head -20)"
  fi
else
  bad "node not found; the kit unit tests did not run"
fi

# ------------------------------------------------------------------- summary
printf '\n%d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
