#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
pid_file="$repo_root/.automation/runner.pid"
port="${AUTOMATION_RUNNER_PORT:-3210}"

if [[ ! -f "$pid_file" ]]; then
  live_pid="$(lsof -tiTCP:${port} -sTCP:LISTEN 2>/dev/null | head -n 1 || true)"
  if [[ -z "$live_pid" ]]; then
    echo "automation-runner is not running"
    exit 0
  fi
  pid="$live_pid"
else
  pid="$(cat "$pid_file")"
fi

if kill -0 "$pid" >/dev/null 2>&1; then
  kill "$pid"
fi

rm -f "$pid_file"
echo "automation-runner stopped"
