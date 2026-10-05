#!/bin/sh
# Test suite for the html-interactive skill plugin. POSIX sh; needs python3
# (manifest and frontmatter checks) and node 18+ (the kit's unit tests).
# Run from anywhere: ./tests/run-tests.sh
#
# Contract under test:
#   - manifests parse and stay in sync (claude version == codex version == kit)
#   - the skill is discoverable: skills/html-interactive/SKILL.md with
#     name + description frontmatter, and the kit files next to it
#   - nothing project-specific leaked into the skill, the kit or the README
#   - the kit behaves: validation, answer reconciliation, export, build
set -u

TESTS_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PLUGIN_DIR=$(dirname -- "$TESTS_DIR")
REPO_DIR=$(dirname -- "$(dirname -- "$PLUGIN_DIR")")
SKILL_DIR="$PLUGIN_DIR/skills/html-interactive"
KIT_DIR="$SKILL_DIR/kit"

pass=0
fail=0

ok()   { pass=$((pass + 1)); printf 'ok   - %s\n' "$1"; }
bad()  { fail=$((fail + 1)); printf 'FAIL - %s\n' "$1"; }

# ----------------------------------------------------------------- manifests
for m in "$REPO_DIR/.claude-plugin/marketplace.json" \
         "$PLUGIN_DIR/.claude-plugin/plugin.json" \
         "$PLUGIN_DIR/.codex-plugin/plugin.json"; do
  if python3 -m json.tool "$m" >/dev/null 2>&1; then ok "manifest parses: ${m#"$REPO_DIR"/}"; else bad "manifest parses: $m"; fi
done

PLUGIN_VERSION=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["version"])' "$PLUGIN_DIR/.claude-plugin/plugin.json")
CODEX_VERSION=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["version"])' "$PLUGIN_DIR/.codex-plugin/plugin.json")
if [ "$PLUGIN_VERSION" = "$CODEX_VERSION" ]; then
  ok "claude/codex plugin.json versions in sync ($PLUGIN_VERSION)"
else
  bad "version drift: claude=$PLUGIN_VERSION codex=$CODEX_VERSION"
fi

if grep -q "KIT_VERSION = '$PLUGIN_VERSION'" "$KIT_DIR/runtime.js" 2>/dev/null; then
  ok "kit version matches the plugin version ($PLUGIN_VERSION)"
else
  bad "runtime.js KIT_VERSION does not match plugin version $PLUGIN_VERSION"
fi

CODEX_SKILLS=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("skills",""))' "$PLUGIN_DIR/.codex-plugin/plugin.json")
if [ "$CODEX_SKILLS" = "./skills/" ]; then
  ok "codex manifest declares skills: ./skills/"
else
  bad "codex manifest skills field is '$CODEX_SKILLS', expected './skills/'"
fi

MARKET_HAS=$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); print(any(p["name"]=="html-interactive" and p["source"]=="./utils/html-interactive" for p in d["plugins"]))' "$REPO_DIR/.claude-plugin/marketplace.json")
if [ "$MARKET_HAS" = "True" ]; then
  ok "marketplace.json lists html-interactive with the right source"
else
  bad "marketplace.json entry for html-interactive missing or wrong source"
fi

# --------------------------------------------------------------------- skill
if [ -f "$SKILL_DIR/SKILL.md" ]; then ok "SKILL.md exists at skills/html-interactive/"; else bad "SKILL.md missing"; fi

if python3 - "$SKILL_DIR/SKILL.md" <<'EOF' >/dev/null 2>&1
import sys
lines = open(sys.argv[1]).read().split("\n")
assert lines[0] == "---"
end = lines[1:].index("---") + 1
front = "\n".join(lines[1:end])
assert "name: html-interactive" in front, front
desc = front.split("description:", 1)[1].strip()
assert desc.startswith("Use when") and len(desc) > 40
assert len(front) <= 1024
EOF
then
  ok "SKILL.md frontmatter has name + a 'Use when' description within 1024 chars"
else
  bad "SKILL.md frontmatter missing name, or description not in 'Use when' form, or too long"
fi

for f in runtime.js kit.css build.mjs example.json; do
  if [ -f "$KIT_DIR/$f" ]; then ok "kit/$f exists"; else bad "kit/$f missing"; fi
done

if grep -q 'kit/build.mjs' "$SKILL_DIR/SKILL.md" && grep -q 'kit/example.json' "$SKILL_DIR/SKILL.md"; then
  ok "SKILL.md points at the build script and the example"
else
  bad "SKILL.md does not reference kit/build.mjs and kit/example.json"
fi

if grep -Eq 'https?://' "$KIT_DIR/runtime.js" "$KIT_DIR/kit.css"; then
  bad "the kit references a network resource; generated pages must work offline"
else
  ok "runtime and styles reference no network resource"
fi

# --------------------------------------------------------------- scrub check
# The author's name legitimately appears in the plugin manifests and the repo
# slug (chakkyy/agent-utils) in install commands, so only skill content, kit
# and README are scrubbed, and the slug is not part of the pattern.
LEAKS=$(grep -riEn 'whalemate|cemento|giggi|mauro|carlos|linear\.app|DEV-[0-9]|/Users/|~/Desktop|boda|casorio' \
  "$SKILL_DIR" "$PLUGIN_DIR/README.md" "$TESTS_DIR/kit.test.mjs" 2>/dev/null || true)
if [ -z "$LEAKS" ]; then
  ok "no personal/project data in skill content, kit, tests or README"
else
  bad "personal data leaked into the generic skill:
$LEAKS"
fi

# ----------------------------------------------------------------- kit tests
if command -v node >/dev/null 2>&1; then
  if KIT_OUT=$(node --test "$TESTS_DIR/kit.test.mjs" 2>&1); then
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
