import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateOpenPullRequest } from '../../scripts/lib/pr-sweep.mjs';

test('evaluateOpenPullRequest - when PR is draft - returns ineligible', () => {
  // Arrange
  const draftPullRequest = {
    number: 1,
    draft: true,
    head: { ref: 'codex/test', repo: { owner: { login: 'Hany-R-Mahmoud' } } },
  };

  // Act
  const result = evaluateOpenPullRequest(
    draftPullRequest,
    'Hany-R-Mahmoud',
  );

  // Assert
  assert.deepEqual(result, { eligible: false, reason: 'draft' });
});

test('evaluateOpenPullRequest - when head owner differs - returns ineligible', () => {
  // Arrange
  const forkedPullRequest = {
    number: 2,
    draft: false,
    head: { ref: 'codex/test', repo: { owner: { login: 'someone-else' } } },
  };

  // Act
  const result = evaluateOpenPullRequest(
    forkedPullRequest,
    'Hany-R-Mahmoud',
  );

  // Assert
  assert.deepEqual(result, { eligible: false, reason: 'fork-or-unknown-owner' });
});

test('evaluateOpenPullRequest - when PR is same repo and ready - returns eligible metadata', () => {
  // Arrange
  const readyPullRequest = {
    number: 3,
    title: 'Ready PR',
    html_url: 'https://example.test/pr/3',
    draft: false,
    head: {
      ref: 'codex/ready',
      sha: 'abc123',
      repo: { owner: { login: 'Hany-R-Mahmoud' } },
    },
  };

  // Act
  const result = evaluateOpenPullRequest(
    readyPullRequest,
    'Hany-R-Mahmoud',
  );

  // Assert
  assert.deepEqual(result, {
    eligible: true,
    reason: 'eligible',
    branch: 'codex/ready',
    headSha: 'abc123',
    number: 3,
    title: 'Ready PR',
    url: 'https://example.test/pr/3',
  });
});

test('evaluateOpenPullRequest - when head branch is main - returns ineligible', () => {
  // Arrange
  const invalidHeadPullRequest = {
    number: 4,
    draft: false,
    head: { ref: 'main', repo: { owner: { login: 'Hany-R-Mahmoud' } } },
  };

  // Act
  const result = evaluateOpenPullRequest(
    invalidHeadPullRequest,
    'Hany-R-Mahmoud',
  );

  // Assert
  assert.deepEqual(result, { eligible: false, reason: 'invalid-head-branch' });
});

test('evaluateOpenPullRequest - when PR head matches active blocker - returns ineligible', () => {
  // Arrange
  const blockedPullRequest = {
    number: 5,
    title: 'Blocked PR',
    html_url: 'https://example.test/pr/5',
    draft: false,
    head: {
      ref: 'codex/blocked',
      sha: 'deadbeef',
      repo: { owner: { login: 'Hany-R-Mahmoud' } },
    },
  };

  // Act
  const result = evaluateOpenPullRequest(
    blockedPullRequest,
    'Hany-R-Mahmoud',
    {
      blocker: {
        prNumber: 5,
        branch: 'codex/blocked',
        headSha: 'deadbeef',
        manualActionRequired: true,
        blockedAt: '2026-03-22T13:13:45.469Z',
        stopReason: 'Push failed',
      },
    },
  );

  // Assert
  assert.deepEqual(result, {
    eligible: false,
    reason: 'manual-action-required',
    branch: 'codex/blocked',
    number: 5,
    title: 'Blocked PR',
    url: 'https://example.test/pr/5',
    blockedAt: '2026-03-22T13:13:45.469Z',
    stopReason: 'Push failed',
  });
});

test('evaluateOpenPullRequest - when PR head changed after blocker - returns eligible again', () => {
  // Arrange
  const updatedPullRequest = {
    number: 6,
    title: 'Updated PR',
    html_url: 'https://example.test/pr/6',
    draft: false,
    head: {
      ref: 'codex/updated',
      sha: 'newsha',
      repo: { owner: { login: 'Hany-R-Mahmoud' } },
    },
  };

  // Act
  const result = evaluateOpenPullRequest(
    updatedPullRequest,
    'Hany-R-Mahmoud',
    {
      blocker: {
        prNumber: 6,
        branch: 'codex/updated',
        headSha: 'oldsha',
        manualActionRequired: true,
        blockedAt: '2026-03-22T13:13:45.469Z',
        stopReason: 'Push failed',
      },
    },
  );

  // Assert
  assert.deepEqual(result, {
    eligible: true,
    reason: 'eligible',
    branch: 'codex/updated',
    headSha: 'newsha',
    number: 6,
    title: 'Updated PR',
    url: 'https://example.test/pr/6',
  });
});
