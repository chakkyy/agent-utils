#!/bin/sh
# time-awareness — prompt-submit hook for Claude Code (and Codex CLI).
# Prints a JSON additionalContext payload carrying the machine's current local
# date & time — or prints NOTHING (exit 0, empty stdout) whenever a complete,
# trustworthy timestamp cannot be produced. Fail-open by contract: this hook
# must never block a prompt and must never inject an empty or misleading time.
#
# Timezone: system timezone by default. Override with TIME_AWARENESS_TZ set to
# an IANA zone name (e.g. America/Argentina/Buenos_Aires). Unknown or unsafe
# values are rejected (diagnostic on stderr only) rather than silently
# producing UTC, which is what an invalid TZ does on macOS.

fail_open() {
  [ -n "${1:-}" ] && printf 'time-awareness: %s\n' "$1" >&2
  exit 0
}

command -v date >/dev/null 2>&1 || fail_open "date(1) not found; skipping time injection"

if [ -n "${TIME_AWARENESS_TZ:-}" ]; then
  # Reject anything that is not a plain IANA zone name: no absolute paths,
  # no traversal, no leading dots, and only the characters zone names use.
  case "$TIME_AWARENESS_TZ" in
    /* | .* | */../* | ../* | */.. | *[!A-Za-z0-9/_+-]*)
      fail_open "rejected TIME_AWARENESS_TZ '$TIME_AWARENESS_TZ' (not a valid IANA zone name)" ;;
  esac
  # The zone must exist in the system tzdata; otherwise date would silently
  # fall back to UTC while we claim the time is trustworthy.
  zone_ok=
  for zonedir in /usr/share/zoneinfo /usr/share/lib/zoneinfo /etc/zoneinfo; do
    if [ -f "$zonedir/$TIME_AWARENESS_TZ" ]; then
      zone_ok=1
      break
    fi
  done
  [ -n "$zone_ok" ] || fail_open "unknown IANA zone TIME_AWARENESS_TZ '$TIME_AWARENESS_TZ'; skipping time injection"
  TZ="$TIME_AWARENESS_TZ"
  export TZ
fi

# Single date(1) call: weekday, date, time, UTC offset and zone abbreviation
# are captured from the same instant. Two calls could straddle a minute or a
# DST transition and disagree. LC_ALL=C keeps weekday names in English so the
# output shape below is stable across machine locales.
now=$(LC_ALL=C date '+%A %Y-%m-%d %H:%M %z %Z') || fail_open "date(1) failed"

# Inject only if the output matches the exact expected shape. Anything else —
# empty, truncated, or with unexpected characters — is untrustworthy: stay
# silent instead of asserting a false time. The allowed character set contains
# no quotes, backslashes or control characters, so the payload is JSON-safe
# without an escaping pass (and needs no runtime dependency like jq).
case "$now" in
  Monday\ * | Tuesday\ * | Wednesday\ * | Thursday\ * | Friday\ * | Saturday\ * | Sunday\ *) ;;
  *) fail_open "unexpected date(1) output '$now'; skipping time injection" ;;
esac
case "$now" in
  *[!A-Za-z0-9\ :+-]*) fail_open "unexpected characters in date(1) output '$now'; skipping time injection" ;;
esac

printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"Current local date & time: %s. This is live from the user'\''s machine — trust it over the session start date or any earlier timestamps in this conversation."}}\n' "$now"
