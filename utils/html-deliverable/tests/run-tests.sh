#!/bin/sh
# Test suite for the html-deliverable skill plugin. POSIX sh, no dependencies
# beyond python3 (for JSON/YAML-frontmatter checks) and grep.
# Run from anywhere: ./tests/run-tests.sh
#
# Contract under test:
#   - manifests parse and stay in sync (claude version == codex version)
#   - the skill is discoverable: skills/html-deliverable/SKILL.md with
#     name + description frontmatter, and reference.html next to it
#   - the generic template leaked no personal/project-specific data
set -u

TESTS_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PLUGIN_DIR=$(dirname -- "$TESTS_DIR")
REPO_DIR=$(dirname -- "$(dirname -- "$PLUGIN_DIR")")
SKILL_DIR="$PLUGIN_DIR/skills/html-deliverable"

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

CODEX_SKILLS=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1])).get("skills",""))' "$PLUGIN_DIR/.codex-plugin/plugin.json")
if [ "$CODEX_SKILLS" = "./skills/" ]; then
  ok "codex manifest declares skills: ./skills/"
else
  bad "codex manifest skills field is '$CODEX_SKILLS', expected './skills/'"
fi

MARKET_HAS=$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); print(any(p["name"]=="html-deliverable" and p["source"]=="./utils/html-deliverable" for p in d["plugins"]))' "$REPO_DIR/.claude-plugin/marketplace.json")
if [ "$MARKET_HAS" = "True" ]; then
  ok "marketplace.json lists html-deliverable with the right source"
else
  bad "marketplace.json entry for html-deliverable missing or wrong source"
fi

# --------------------------------------------------------------------- skill
if [ -f "$SKILL_DIR/SKILL.md" ]; then ok "SKILL.md exists at skills/html-deliverable/"; else bad "SKILL.md missing"; fi

if python3 - "$SKILL_DIR/SKILL.md" <<'EOF' >/dev/null 2>&1
import sys
lines = open(sys.argv[1]).read().split("\n")
assert lines[0] == "---"
end = lines[1:].index("---") + 1
front = "\n".join(lines[1:end])
assert "name: html-deliverable" in front, front
assert "description:" in front and len(front.split("description:", 1)[1].strip()) > 40
EOF
then
  ok "SKILL.md frontmatter has name + non-trivial description"
else
  bad "SKILL.md frontmatter missing name or description"
fi

if [ -f "$SKILL_DIR/reference.html" ]; then ok "reference.html exists next to SKILL.md"; else bad "reference.html missing"; fi

if grep -q 'lang="en"' "$SKILL_DIR/reference.html" 2>/dev/null && grep -qi '</html>' "$SKILL_DIR/reference.html" 2>/dev/null; then
  ok "reference.html is an English html document"
else
  bad "reference.html missing lang=\"en\" or closing </html>"
fi

if grep -q 'reference.html' "$SKILL_DIR/SKILL.md"; then
  ok "SKILL.md links to reference.html"
else
  bad "SKILL.md does not reference reference.html"
fi

# --------------------------------------------------------------- scrub check
# The generic template must not carry data from the personal skill it came
# from. The author's name legitimately appears in the plugin manifests and
# the repo slug (chakkyy/agent-utils) in install commands, so only skill
# content and README are scrubbed, and the slug is not part of the pattern.
LEAKS=$(grep -riEn 'whalemate|giggi|mauro|carlos|linear\.app|DEV-[0-9]|002DF0|lang="es"|cc report' \
  "$SKILL_DIR" "$PLUGIN_DIR/README.md" 2>/dev/null || true)
if [ -z "$LEAKS" ]; then
  ok "no personal/project data in skill content or README"
else
  bad "personal data leaked into the generic template:
$LEAKS"
fi

# ------------------------------------------------------------------- summary
printf '\n%d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
