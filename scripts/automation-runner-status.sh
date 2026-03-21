#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
automation_dir="$repo_root/.automation"
pid_file="$automation_dir/runner.pid"
log_file="$automation_dir/runner.log"
github_token_file="$automation_dir/github.token"
port="${AUTOMATION_RUNNER_PORT:-3210}"

if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" >/dev/null 2>&1; then
  echo "automation-runner running with pid $(cat "$pid_file")"
else
  live_pid="$(lsof -tiTCP:${port} -sTCP:LISTEN 2>/dev/null | head -n 1 || true)"
  if [[ -n "$live_pid" ]]; then
    echo "$live_pid" > "$pid_file"
    echo "automation-runner running with pid $live_pid"
  else
    echo "automation-runner not running"
  fi
fi

if [[ -f "$log_file" ]]; then
  echo "--- recent log ---"
  tail -20 "$log_file"
fi

if [[ -f "$github_token_file" ]] && [[ -n "$(tr -d '\r\n' < "$github_token_file")" ]]; then
  echo "github automation token: configured (.automation/github.token)"
else
  echo "github automation token: missing"
fi
