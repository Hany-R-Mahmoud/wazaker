#!/usr/bin/env bash

set -euo pipefail

exec direnv exec "$(cd "$(dirname "$0")/.." && pwd)" "$@"
