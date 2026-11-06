#!/bin/sh
# Flags shipped plugin content that depends on someone's own environment instead
# of staying generic: the author's name, ticket ids, hosted tracker and wiki
# links, home-directory paths and non-English page templates.
#
# A pattern list only catches these shapes. A pass is not proof the content is
# free of private data or secrets.
#
# Usage: scrub.sh <plugin-dir> <path>...
# The author's name comes from <plugin-dir>/.claude-plugin/plugin.json. Attribution
# there, in LICENSE and in the install slug is deliberate, so callers pass only
# skill content, docs and tests as <path>.
# Exit: 0 clean, 1 leak found (matches on stdout), 2 could not run the check.
set -u

# Without paths, grep would search somewhere the caller never asked for.
[ "$#" -ge 2 ] || { echo "scrub: usage: scrub.sh <plugin-dir> <path>..." >&2; exit 2; }

PLUGIN_DIR=$1
shift

AUTHOR=$(python3 -c '
import json, re, sys
name = json.load(open(sys.argv[1]))["author"]["name"]
words = [re.escape(w) for w in name.split() if len(w) >= 3]
assert words
print("|".join(words))
' "$PLUGIN_DIR/.claude-plugin/plugin.json" 2>/dev/null) || {
  echo "scrub: no author.name readable in $PLUGIN_DIR/.claude-plugin/plugin.json" >&2
  exit 2
}

# Whole words only, so a short name doesn't flag ordinary words that contain it.
AUTHOR="(^|[^[:alnum:]])($AUTHOR)($|[^[:alnum:]])"
TRACKERS='linear\.app|atlassian\.net|slack\.com|notion\.(so|site)'
HOME_PATHS='/Users/|/home/|~/[A-Z]|C:\\Users\\'
# Starts with a letter so templated values like lang="${x}" stay out of it.
NON_ENGLISH='lang="([a-df-z]|e[a-mo-z])'

# grep exits 1 for "no match" and 2 for "could not search". Only the first is clean.
LEAKS=$(grep -rnIiE "$AUTHOR|$TRACKERS|$HOME_PATHS|$NON_ENGLISH" "$@")
[ "$?" -le 1 ] || exit 2

# Case-sensitive: lowercase look-alikes (tier-1, item-2) are ordinary slugs. The
# exclusions are the invented ACME sample ids and common standard names; they are
# filtered per match so a real id on the same line still shows.
ID_SHAPES=$(grep -rnIoHE '[A-Z][A-Z0-9]{1,9}-[0-9]+' "$@")
[ "$?" -le 1 ] || exit 2
TICKETS=$(printf '%s\n' "$ID_SHAPES" | grep -vE ':(ACME|UTF|SHA|ISO)-[0-9]+$')
[ "$?" -le 1 ] || exit 2

[ -z "$LEAKS$TICKETS" ] && exit 0
printf '%s\n' "$LEAKS" "$TICKETS" | sed '/^$/d'
exit 1
