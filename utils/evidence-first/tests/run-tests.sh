#!/bin/sh
# Test suite for the evidence-first skill plugin. POSIX sh, no dependencies
# beyond python3 (for JSON/YAML-frontmatter checks) and grep.
# Run from anywhere: ./tests/run-tests.sh
#
# Contract under test:
#   - manifests parse and stay in sync (claude version == codex version)
#   - the skill is discoverable: skills/evidence-first/SKILL.md with
#     name + description frontmatter, and PRINCIPLES.md next to it
#   - the load-bearing rules survive edits: the four receipt parts, the
#     output-contract blocks, the NO EVIDENCE stop condition
#   - the generic skill leaked no personal/project-specific data
set -u

TESTS_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PLUGIN_DIR=$(dirname -- "$TESTS_DIR")
REPO_DIR=$(dirname -- "$(dirname -- "$PLUGIN_DIR")")
SKILL_DIR="$PLUGIN_DIR/skills/evidence-first"

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

MARKET_HAS=$(python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); print(any(p["name"]=="evidence-first" and p["source"]=="./utils/evidence-first" for p in d["plugins"]))' "$REPO_DIR/.claude-plugin/marketplace.json")
if [ "$MARKET_HAS" = "True" ]; then
  ok "marketplace.json lists evidence-first with the right source"
else
  bad "marketplace.json entry for evidence-first missing or wrong source"
fi

# --------------------------------------------------------------------- skill
if [ -f "$SKILL_DIR/SKILL.md" ]; then ok "SKILL.md exists at skills/evidence-first/"; else bad "SKILL.md missing"; fi

if python3 - "$SKILL_DIR/SKILL.md" <<'EOF' >/dev/null 2>&1
import sys
lines = open(sys.argv[1]).read().split("\n")
assert lines[0] == "---"
end = lines[1:].index("---") + 1
front = "\n".join(lines[1:end])
assert "name: evidence-first" in front, front
assert "description:" in front and len(front.split("description:", 1)[1].strip()) > 40
EOF
then
  ok "SKILL.md frontmatter has name + non-trivial description"
else
  bad "SKILL.md frontmatter missing name or description"
fi

if [ -f "$SKILL_DIR/PRINCIPLES.md" ]; then ok "PRINCIPLES.md exists next to SKILL.md"; else bad "PRINCIPLES.md missing"; fi

if grep -q 'PRINCIPLES.md' "$SKILL_DIR/SKILL.md"; then
  ok "SKILL.md links to PRINCIPLES.md"
else
  bad "SKILL.md does not reference PRINCIPLES.md"
fi

# ------------------------------------------------------- load-bearing rules
# These are the parts a well-meaning edit tends to soften. If one disappears,
# the skill still reads fine and stops working.
for needle in 'SEARCH LOG' 'VERIFIED EVIDENCE' 'CASES REJECTED' 'NO EVIDENCE'; do
  if grep -q "$needle" "$SKILL_DIR/SKILL.md"; then
    ok "SKILL.md keeps the '$needle' block"
  else
    bad "SKILL.md lost the '$needle' block"
  fi
done

for needle in 'Identifier' 'Link' 'Verbatim quote' 'Causal tie'; do
  if grep -q "$needle" "$SKILL_DIR/SKILL.md"; then
    ok "receipt part present: $needle"
  else
    bad "receipt part missing: $needle"
  fi
done

# PRINCIPLES.md is only useful if its quotes stay traceable: every ✅/⚠️ entry
# is expected to carry a resolving link.
PRINCIPLE_LINKS=$(grep -c 'http' "$SKILL_DIR/PRINCIPLES.md" 2>/dev/null || echo 0)
if [ "$PRINCIPLE_LINKS" -ge 8 ]; then
  ok "PRINCIPLES.md carries sources ($PRINCIPLE_LINKS links)"
else
  bad "PRINCIPLES.md has only $PRINCIPLE_LINKS links, expected at least 8"
fi

# --------------------------------------------------------------- scrub check
# The generic skill must not carry data from the personal/company copies it is
# synced with. The author's name legitimately appears in the plugin manifests
# and the repo slug (chakkyy/agent-utils) in install commands, so only skill
# content and README are scrubbed, and the slug is not part of the pattern.
LEAKS=$(grep -riEn 'whalemate|giggi|mauro|carlos|linear\.app|DEV-[0-9]|ZEN-[0-9]|coderabbit|lang="es"|cc report' \
  "$SKILL_DIR" "$PLUGIN_DIR/README.md" 2>/dev/null || true)
if [ -z "$LEAKS" ]; then
  ok "no personal/project data in skill content or README"
else
  bad "personal data leaked into the generic skill:
$LEAKS"
fi

# ------------------------------------------------------------------- summary
printf '\n%d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
