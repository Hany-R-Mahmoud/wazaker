#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
automation_dir="$repo_root/.automation"
pid_file="$automation_dir/runner.pid"
log_file="$automation_dir/runner.log"
token_file="$automation_dir/runner.token"
github_token_file="$automation_dir/github.token"

mkdir -p "$automation_dir"

existing_pid="$(lsof -tiTCP:${AUTOMATION_RUNNER_PORT:-3210} -sTCP:LISTEN 2>/dev/null | head -n 1 || true)"
if [[ -n "$existing_pid" ]]; then
  echo "$existing_pid" > "$pid_file"
  echo "automation-runner already listening on port ${AUTOMATION_RUNNER_PORT:-3210} with pid $existing_pid"
  exit 0
fi

if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" >/dev/null 2>&1; then
  echo "automation-runner already running with pid $(cat "$pid_file")"
  exit 0
fi

if [[ ! -f "$token_file" ]]; then
  python3 - <<'PY' > "$token_file"
import secrets
print(secrets.token_urlsafe(32))
PY
fi

token="$(cat "$token_file")"
github_token="${AUTOMATION_GITHUB_TOKEN:-${GITHUB_TOKEN:-${GH_TOKEN:-}}}"

if [[ -z "$github_token" && -f "$github_token_file" ]]; then
  github_token="$(tr -d '\r\n' < "$github_token_file")"
fi

if [[ -z "$github_token" ]] && command -v gh >/dev/null 2>&1; then
  github_token="$(gh auth token 2>/dev/null || true)"
fi

if [[ -n "$github_token" ]]; then
  umask 077
  printf '%s\n' "$github_token" > "$github_token_file"
fi

AUTOMATION_GITHUB_TOKEN="$github_token" \
AUTOMATION_RUNNER_TOKEN="$token" \
AUTOMATION_RUNNER_PORT="${AUTOMATION_RUNNER_PORT:-3210}" \
nohup node "$repo_root/scripts/automation-runner.mjs" >> "$log_file" 2>&1 &

echo $! > "$pid_file"
echo "automation-runner started with pid $(cat "$pid_file")"
