#!/usr/bin/env bash

set -euo pipefail

git checkout main
git fetch origin
git pull --ff-only origin main

echo "main is up to date."
