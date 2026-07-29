#!/bin/bash
# Claude Code hook: forwards Notification(permission_prompt)/Stop events to Slack
input=$(cat)

project_dir="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
if [ -z "${SLACK_WEBHOOK_URL:-}" ] && [ -f "${project_dir}/.env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  source "${project_dir}/.env.local"
  set +a
fi

webhook="${SLACK_WEBHOOK_URL:-}"
if [ -z "$webhook" ] || [ "$webhook" = "REPLACE_WITH_YOUR_SLACK_WEBHOOK_URL" ]; then
  exit 0
fi

event=$(echo "$input" | jq -r '.hook_event_name // empty')
project=$(basename "$(echo "$input" | jq -r '.cwd // empty')")

case "$event" in
  Notification)
    message=$(echo "$input" | jq -r '.message // empty')
    text=":lock: *[${project}]* 권한 요청\n${message}"
    ;;
  Stop)
    last=$(echo "$input" | jq -r '.last_assistant_message // empty' | cut -c1-500)
    text=":white_check_mark: *[${project}]* 작업 완료\n${last}"
    ;;
  *)
    exit 0
    ;;
esac

payload=$(jq -n --arg text "$text" '{text: $text}')
curl -s -X POST -H 'Content-Type: application/json' -d "$payload" "$webhook" >/dev/null

exit 0
