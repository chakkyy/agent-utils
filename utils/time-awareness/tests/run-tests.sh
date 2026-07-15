#!/bin/sh
# Test suite for the time-awareness hook. POSIX sh, no dependencies beyond
# python3 (for JSON validation). Run from anywhere: ./tests/run-tests.sh
#
# Contract under test:
#   - success  => exit 0, stdout is ONE line of valid JSON with a fully-formed
#                 timestamp (never empty, never a silently different zone)
#   - fail-open => exit 0, stdout completely empty (diagnostics on stderr only)
#   - the hook command in hooks.json survives paths with spaces/unicode
set -u

TESTS_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PLUGIN_DIR=$(dirname -- "$TESTS_DIR")
SCRIPT="$PLUGIN_DIR/hooks/inject-time.sh"
REPO_DIR=$(dirname -- "$(dirname -- "$PLUGIN_DIR")")
WORK=$(mktemp -d "${TMPDIR:-/tmp}/time-awareness-tests.XXXXXX")
trap 'rm -rf "$WORK"' EXIT INT TERM

pass=0
fail=0

ok()   { pass=$((pass + 1)); printf 'ok   - %s\n' "$1"; }
bad()  { fail=$((fail + 1)); printf 'FAIL - %s\n' "$1"; }

# run <name> ... : capture stdout/exit of a command into $OUT/$RC
run() {
  OUT=$("$@" 2>"$WORK/stderr"); RC=$?
  ERR=$(cat "$WORK/stderr")
}

json_valid() {
  printf '%s' "$1" | python3 -c '
import json, sys
d = json.load(sys.stdin)
o = d["hookSpecificOutput"]
assert o["hookEventName"] == "UserPromptSubmit"
ctx = o["additionalContext"]
assert ctx.startswith("Current local date & time: "), ctx
# never an empty/blank timestamp
import re
assert re.search(r"(Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day \d{4}-\d{2}-\d{2} \d{2}:\d{2} [+-]\d{4} [A-Za-z0-9+:-]+\.", ctx), ctx
' 2>/dev/null
}

assert_success_json() { # <name>
  if [ "$RC" -eq 0 ] && json_valid "$OUT"; then ok "$1"; else bad "$1 (rc=$RC out=$OUT)"; fi
}

assert_fail_open() { # <name>
  if [ "$RC" -eq 0 ] && [ -z "$OUT" ]; then ok "$1"; else bad "$1 (rc=$RC out=$OUT)"; fi
}

# ---------------------------------------------------------------- happy path
run sh "$SCRIPT"
assert_success_json "normal run emits valid JSON with full timestamp"

# ------------------------------------------------- paths with spaces/unicode
# Execute the EXACT command string from hooks.json, as the harness would.
HOOK_CMD=$(python3 -c '
import json, sys
h = json.load(open(sys.argv[1]))
print(h["hooks"]["UserPromptSubmit"][0]["hooks"][0]["command"])
' "$PLUGIN_DIR/hooks/hooks.json")

for name in "path with spaces" "path'with quote" "señal 時間 ✓"; do
  dst="$WORK/$name/time-awareness"
  mkdir -p "$dst"
  cp -R "$PLUGIN_DIR/hooks" "$dst/"
  run env CLAUDE_PLUGIN_ROOT="$dst" sh -c "$HOOK_CMD"
  assert_success_json "hooks.json command works from plugin root: [$name]"
done

# ----------------------------------------------------------------- timezones
for tz in UTC Asia/Tokyo Europe/Madrid America/Argentina/Buenos_Aires; do
  run env TIME_AWARENESS_TZ="$tz" sh "$SCRIPT"
  assert_success_json "valid IANA zone accepted: $tz"
done

run env TIME_AWARENESS_TZ="Asia/Tokyo" sh "$SCRIPT"
case "$OUT" in
  *"+0900 JST"*) ok "TIME_AWARENESS_TZ actually changes the emitted zone" ;;
  *) bad "TIME_AWARENESS_TZ actually changes the emitted zone (out=$OUT)" ;;
esac

for tz in "Not/AZone" "../../etc/passwd" "/etc/passwd" "America/../../../etc/passwd" "UTC;date" 'UTC$(reboot)' "UTC UTC" ".." "America"; do
  run env TIME_AWARENESS_TZ="$tz" sh "$SCRIPT"
  assert_fail_open "invalid/unsafe zone rejected silently: [$tz]"
  [ -n "$ERR" ] && ok "diagnostic went to stderr for: [$tz]" || bad "no stderr diagnostic for: [$tz]"
done

# ------------------------------------------------------------- date failures
run env PATH=/nonexistent /bin/sh "$SCRIPT"
assert_fail_open "date(1) missing => silent fail-open"

mkdir -p "$WORK/stub"
cat > "$WORK/stub/date" <<'EOF'
#!/bin/sh
exit 1
EOF
chmod +x "$WORK/stub/date"
run env PATH="$WORK/stub" /bin/sh "$SCRIPT"
assert_fail_open "date(1) exits non-zero => silent fail-open"

cat > "$WORK/stub/date" <<'EOF'
#!/bin/sh
exit 0
EOF
run env PATH="$WORK/stub" /bin/sh "$SCRIPT"
assert_fail_open "date(1) empty output => silent fail-open"

cat > "$WORK/stub/date" <<'EOF'
#!/bin/sh
printf 'Wednesday 2026-07-15 10:59 "quoted\n'
EOF
run env PATH="$WORK/stub" /bin/sh "$SCRIPT"
assert_fail_open "date(1) output with quotes => silent fail-open (JSON safety)"

# ------------------------------------------- single-instant capture (DST/min)
# A stub date that answers a different minute on every invocation: if the
# script called date more than once, the injected text would mix instants.
cat > "$WORK/stub/date" <<EOF
#!/bin/sh
count_file="$WORK/stub/count"
EOF
cat >> "$WORK/stub/date" <<'EOF'
n=$(cat "$count_file" 2>/dev/null || echo 0)
n=$((n + 1))
printf '%s' "$n" > "$count_file"
printf 'Sunday 2026-11-01 01:%02d -0300 -03\n' "$n"
EOF
run env PATH="$WORK/stub" /bin/sh "$SCRIPT"
calls=$(cat "$WORK/stub/count")
if [ "$calls" = "1" ] && json_valid "$OUT"; then
  ok "date(1) invoked exactly once => text and zone from the same instant"
else
  bad "date(1) invoked $calls times (want 1)"
fi

# ----------------------------------------------------------------- packaging
[ -x "$SCRIPT" ] && ok "inject-time.sh has the executable bit" || bad "inject-time.sh missing executable bit"

for m in "$REPO_DIR/.claude-plugin/marketplace.json" \
         "$PLUGIN_DIR/.claude-plugin/plugin.json" \
         "$PLUGIN_DIR/.codex-plugin/plugin.json" \
         "$PLUGIN_DIR/hooks/hooks.json"; do
  if python3 -m json.tool "$m" >/dev/null 2>&1; then ok "manifest parses: ${m#"$REPO_DIR"/}"; else bad "manifest parses: $m"; fi
done

case "$HOOK_CMD" in
  '"${CLAUDE_PLUGIN_ROOT}'*'"') ok "hooks.json command quotes \${CLAUDE_PLUGIN_ROOT} path" ;;
  *) bad "hooks.json command is not quoted: $HOOK_CMD" ;;
esac

PLUGIN_VERSION=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["version"])' "$PLUGIN_DIR/.claude-plugin/plugin.json")
CODEX_VERSION=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["version"])' "$PLUGIN_DIR/.codex-plugin/plugin.json")
MARKET_VERSION=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["metadata"]["version"])' "$REPO_DIR/.claude-plugin/marketplace.json")
if [ "$PLUGIN_VERSION" = "$MARKET_VERSION" ] && [ "$PLUGIN_VERSION" = "$CODEX_VERSION" ]; then
  ok "claude/codex plugin.json and marketplace.json versions in sync ($PLUGIN_VERSION)"
else
  bad "version drift: claude=$PLUGIN_VERSION codex=$CODEX_VERSION marketplace=$MARKET_VERSION"
fi

# --------------------------------------------------------------------- speed
start=$(date +%s)
i=0
while [ $i -lt 20 ]; do sh "$SCRIPT" >/dev/null 2>&1; i=$((i + 1)); done
elapsed=$(( $(date +%s) - start ))
if [ "$elapsed" -le 5 ]; then
  ok "fast enough: 20 runs in ${elapsed}s (hook timeout is 5s per run)"
else
  bad "too slow: 20 runs took ${elapsed}s"
fi

# ------------------------------------------------- optional real smoke tests
# Costs tokens / needs the CLIs: opt in with TIME_AWARENESS_SMOKE=1
if [ "${TIME_AWARENESS_SMOKE:-}" = "1" ]; then
  if command -v claude >/dev/null 2>&1; then
    ANSWER=$(cd "$WORK" && claude -p "What is the current local date and time? Answer with just the timestamp you were given, nothing else." --plugin-dir "$PLUGIN_DIR" --model haiku 2>/dev/null)
    case "$ANSWER" in
      *20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]*) ok "claude smoke: model received the injected timestamp" ;;
      *) bad "claude smoke: unexpected answer: $ANSWER" ;;
    esac
  else
    printf 'skip - claude CLI not available\n'
  fi
else
  printf 'skip - real CLI smoke tests (set TIME_AWARENESS_SMOKE=1 to run)\n'
fi

# ---------------------------------------------------------------------------
printf '\n%d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
