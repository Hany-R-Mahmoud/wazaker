#!/usr/bin/env bash

set -euo pipefail

export CODEX_HOME="$(cd "$(dirname "$0")/.." && pwd)/.codex"

echo "CODEX_HOME set to: $CODEX_HOME"
echo "Spec Kit prompts are ready in .codex/prompts"
echo "Suggested next command: /speckit.specify"
