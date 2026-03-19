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
    head: { ref: 'codex/ready', repo: { owner: { login: 'Hany-R-Mahmoud' } } },
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
