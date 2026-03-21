import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveGithubToken } from '../../scripts/lib/github-token.mjs';

test('resolveGithubToken prefers explicit automation env token', async () => {
  const result = await resolveGithubToken({
    env: {
      AUTOMATION_GITHUB_TOKEN: 'automation-token',
      GITHUB_TOKEN: 'fallback-token',
    },
    readFileToken: () => 'file-token',
    runCommandFn: async () => ({ code: 0, stdout: 'gh-token\n', stderr: '' }),
  });

  assert.deepEqual(result, {
    token: 'automation-token',
    source: 'env',
  });
});

test('resolveGithubToken falls back to token file before gh auth', async () => {
  const result = await resolveGithubToken({
    env: {},
    readFileToken: () => 'file-token',
    runCommandFn: async () => ({ code: 0, stdout: 'gh-token\n', stderr: '' }),
  });

  assert.deepEqual(result, {
    token: 'file-token',
    source: 'file',
  });
});

test('resolveGithubToken falls back to gh auth token when env and file are empty', async () => {
  const result = await resolveGithubToken({
    env: {},
    readFileToken: () => '',
    runCommandFn: async () => ({ code: 0, stdout: 'gh-token\n', stderr: '' }),
  });

  assert.deepEqual(result, {
    token: 'gh-token',
    source: 'gh-auth',
  });
});

test('resolveGithubToken returns empty result when no token source is available', async () => {
  const result = await resolveGithubToken({
    env: {},
    readFileToken: () => '',
    runCommandFn: async () => ({ code: 1, stdout: '', stderr: 'not logged in' }),
  });

  assert.deepEqual(result, {
    token: '',
    source: '',
  });
});
