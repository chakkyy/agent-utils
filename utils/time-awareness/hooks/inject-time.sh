#!/bin/sh
# time-awareness — UserPromptSubmit hook for Claude Code.
# Injects the machine's current local date & time into every user prompt,
# so long-running sessions never assume it's still the time the session started.
#
# Timezone: uses the system timezone by default. Override with TIME_AWARENESS_TZ
# (any IANA zone, e.g. TIME_AWARENESS_TZ=America/Argentina/Buenos_Aires).

if [ -n "$TIME_AWARENESS_TZ" ]; then
  export TZ="$TIME_AWARENESS_TZ"
fi

# LC_ALL=C keeps day names in English regardless of the machine locale,
# so the injected line is stable and unambiguous for the model.
NOW=$(LC_ALL=C date '+%A %Y-%m-%d %H:%M')
ZONE=$(date '+%Z')

# %A/%Y/%H/%Z never produce quotes or backslashes, so plain printf is JSON-safe.
printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"Current local date & time: %s (%s). This is live from the user'\''s machine — trust it over the session start date or any earlier timestamps in this conversation."}}\n' "$NOW" "$ZONE"
