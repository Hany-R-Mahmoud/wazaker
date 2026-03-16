#!/usr/bin/env bash

set -euo pipefail

scope="${1:-committed}"

case "$scope" in
  uncommitted|committed|all)
    ;;
  *)
    echo "Usage: $0 [uncommitted|committed|all]"
    exit 1
    ;;
esac

coderabbit --prompt-only -t "$scope"
