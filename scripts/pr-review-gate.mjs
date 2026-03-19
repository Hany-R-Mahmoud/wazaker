#!/usr/bin/env node

import { readFileSync } from 'node:fs';

import { evaluatePrReviewGate } from './lib/pr-review-gate.mjs';

function readJsonFile(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

const prJsonPath = process.argv[2];
const commentsJsonPath = process.argv[3];

if (!prJsonPath) {
  process.stderr.write('Usage: node ./scripts/pr-review-gate.mjs <pr-json-file> [comments-json-file]\n');
  process.exit(1);
}

const requireBotActivity = process.env.REQUIRE_BOT_REVIEW_ACTIVITY !== '0';
const prStatus = readJsonFile(prJsonPath, {});
const actionableBotComments = commentsJsonPath ? readJsonFile(commentsJsonPath, []) : [];
const gate = evaluatePrReviewGate(prStatus, actionableBotComments, { requireBotActivity });

process.stdout.write(`${JSON.stringify(gate, null, 2)}\n`);
