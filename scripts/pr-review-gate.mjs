#!/usr/bin/env node

import { readFileSync } from 'node:fs';

import { evaluatePrReviewGate } from './lib/pr-review-gate.mjs';

function readJsonFile(path, fallback) {
  try {
    const fileContents = readFileSync(path, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return fallback;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read JSON file ${path}: ${message}`);
  }
}

function validatePrStatus(prStatus) {
  if (!prStatus || typeof prStatus !== 'object' || Array.isArray(prStatus)) {
    return 'Invalid PR status JSON: expected an object.';
  }
  if (typeof prStatus.mergeStateStatus !== 'string') {
    return 'Invalid PR status JSON: mergeStateStatus must be a string.';
  }
  if (typeof prStatus.reviewDecision !== 'string') {
    return 'Invalid PR status JSON: reviewDecision must be a string.';
  }
  if ('statusCheckRollup' in prStatus && typeof prStatus.statusCheckRollup !== 'string' && !Array.isArray(prStatus.statusCheckRollup)) {
    return 'Invalid PR status JSON: statusCheckRollup must be a string or array when present.';
  }
  if ('comments' in prStatus && !Array.isArray(prStatus.comments)) {
    return 'Invalid PR status JSON: comments must be an array when present.';
  }
  if ('latestReviews' in prStatus && !Array.isArray(prStatus.latestReviews)) {
    return 'Invalid PR status JSON: latestReviews must be an array when present.';
  }
  if ('reviews' in prStatus && !Array.isArray(prStatus.reviews)) {
    return 'Invalid PR status JSON: reviews must be an array when present.';
  }

  return null;
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
    const prStatusError = validatePrStatus(prStatus);
    if (prStatusError) {
      throw new Error(prStatusError);
    }
    const actionableBotComments = commentsJsonPath ? readJsonFile(commentsJsonPath, []) : [];
    if (!Array.isArray(actionableBotComments)) {
      throw new Error('Invalid comments JSON: expected an array.');
    }
    const gate = evaluatePrReviewGate(prStatus, actionableBotComments, { requireBotActivity });

    process.stdout.write(`${JSON.stringify(gate, null, 2)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Failed to evaluate PR review gate: ${message}\n`);
    process.exit(1);
  }
}

main();
