#!/bin/sh
# Repo-level checks. POSIX sh; needs python3 and grep.
# Run from anywhere: ./tests/run-tests.sh
#
# Contract under test:
#   - scrub.sh flags each class of environment data and leaves generic content
#     alone, proven against an invented plugin built at runtime
#   - utils without a suite of their own stay generic too
set -u

TESTS_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_DIR=$(dirname -- "$TESTS_DIR")
SCRUB="$TESTS_DIR/scrub.sh"

pass=0
fail=0

ok()   { pass=$((pass + 1)); printf 'ok   - %s\n' "$1"; }
bad()  { fail=$((fail + 1)); printf 'FAIL - %s\n' "$1"; }

FIXTURE=$(mktemp -d)
trap 'rm -rf "$FIXTURE"' EXIT
mkdir -p "$FIXTURE/.claude-plugin"
printf '{"author": {"name": "Jane Example"}}\n' > "$FIXTURE/.claude-plugin/plugin.json"

# Exit 1 means "leak found"; any other failure must not count as a detection.
flags() {
  printf '%s\n' "$2" > "$FIXTURE/README.md"
  sh "$SCRUB" "$FIXTURE" "$FIXTURE/README.md" >/dev/null 2>&1
  if [ "$?" -eq 1 ]; then
    ok "scrub flags $1"
  else
    bad "scrub misses $1: $2"
  fi
}

allows() {
  printf '%s\n' "$2" > "$FIXTURE/README.md"
  if sh "$SCRUB" "$FIXTURE" "$FIXTURE/README.md" >/dev/null 2>&1; then
    ok "scrub allows $1"
  else
    bad "scrub rejects $1: $2"
  fi
}

# ------------------------------------------------------------------ flagged
flags 'the author first name, any case'  'ask jane about it'
flags 'the author last name'             'see Example for details'
flags 'the author name at a line start'  'jane wrote this'
flags 'the author name in a path'        'notes/jane-example.md'
flags 'an uppercase ticket id'           'fixed in ABC-123'
flags 'a ticket next to a sample id'     'ACME-110 and ABC-123'
flags 'a hosted tracker link'            'https://linear.app/some-team/issue/1'
flags 'a hosted wiki link'               'https://some-team.atlassian.net/wiki'
flags 'a macOS home path'                'open /Users/someone/notes.md'
flags 'a Linux home path'                'open /home/someone/notes.md'
flags 'a home-relative folder'           'save it to ~/Desktop/notes.md'
flags 'a non-English document language'  '<html lang="fr">'

# ------------------------------------------------------------------ allowed
allows 'the author name inside a word'   'an exampleless janeway note'
allows 'an English document'             '<html lang="en">'
allows 'a regional English document'     '<html lang="en-GB">'
allows 'a templated language'            '<html lang="${page.lang}">'
allows 'invented sample tickets'         'ACME-110 is a sample'
allows 'encoding and standard names'     'UTF-8, SHA-256, ISO-8601'
allows 'lowercase ids in slugs'          'tier-1 and item-2'
allows 'dotted paths under home'         'read ~/.config/app/brand.md'

# ------------------------------------------------------------- broken input
sh "$SCRUB" "$FIXTURE" </dev/null >/dev/null 2>&1
if [ "$?" -eq 2 ]; then
  ok "scrub reports no paths as an error"
else
  bad "scrub does not report no paths as an error"
fi

sh "$SCRUB" "$FIXTURE" "$FIXTURE/missing.md" >/dev/null 2>&1
if [ "$?" -eq 2 ]; then
  ok "scrub reports a missing path as an error"
else
  bad "scrub does not report a missing path as an error"
fi

printf 'clean text\n' > "$FIXTURE/locked.md"
chmod 000 "$FIXTURE/locked.md"
if [ -r "$FIXTURE/locked.md" ]; then
  printf 'skip - unreadable file (permissions do not apply to this user)\n'
else
  sh "$SCRUB" "$FIXTURE" "$FIXTURE/locked.md" >/dev/null 2>&1
  if [ "$?" -eq 2 ]; then
    ok "scrub reports an unreadable file as an error"
  else
    bad "scrub does not report an unreadable file as an error"
  fi
fi
rm -f "$FIXTURE/locked.md"

rm -f "$FIXTURE/.claude-plugin/plugin.json"
printf 'clean text\n' > "$FIXTURE/README.md"
sh "$SCRUB" "$FIXTURE" "$FIXTURE/README.md" >/dev/null 2>&1
if [ "$?" -eq 2 ]; then
  ok "scrub reports an unreadable manifest as an error"
else
  bad "scrub does not report an unreadable manifest as an error"
fi

# ------------------------------------------- utils without a suite of their own
check_plugin() {
  plugin=$1
  shift
  if LEAKS=$(sh "$SCRUB" "$REPO_DIR/utils/$plugin" "$@" 2>&1); then
    ok "no environment data in $plugin"
  else
    bad "environment data in $plugin:
$LEAKS"
  fi
}

check_plugin live-qa "$REPO_DIR/utils/live-qa/README.md" "$REPO_DIR/utils/live-qa/skills"
check_plugin time-awareness "$REPO_DIR/utils/time-awareness/README.md" "$REPO_DIR/utils/time-awareness/hooks"

# ------------------------------------------------------------------- summary
printf '\n%d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
