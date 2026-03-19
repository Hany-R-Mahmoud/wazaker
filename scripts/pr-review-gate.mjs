#!/usr/bin/env node

import { readFileSync } from 'node:fs';

import { evaluatePrReviewGate } from './lib/pr-review-gate.mjs';

function readJsonFile(path, fallback) {
  try {
    const fileContents = readFileSync(path, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Warning: readJsonFile failed for ${path}: ${message}\n`);
    return fallback;
  }
}

function main() {
  const prJsonPath = process.argv[2];
  const commentsJsonPath = process.argv[3];

  if (!prJsonPath) {
    process.stderr.write('Usage: node ./scripts/pr-review-gate.mjs <pr-json-file> [comments-json-file]\n');
    process.exit(1);
  }

  try {
    const requireBotActivity = process.env.REQUIRE_BOT_REVIEW_ACTIVITY !== '0';
    const prStatus = readJsonFile(prJsonPath);
    if (prStatus === undefined) {
      process.exitCode = 1;
      return;
    }
    const actionableBotComments = commentsJsonPath ? readJsonFile(commentsJsonPath, []) : [];
    const gate = evaluatePrReviewGate(prStatus, actionableBotComments, { requireBotActivity });

    process.stdout.write(`${JSON.stringify(gate, null, 2)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Failed to evaluate PR review gate: ${message}\n`);
    process.exit(1);
  }
}

main();
