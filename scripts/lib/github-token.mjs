import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { automationDir, runCommand } from './automation-platform.mjs';

export const githubTokenFile = join(automationDir, 'github.token');

export function normalizeGithubToken(value) {
  const token = String(value || '').trim();
  return token.length > 0 ? token : '';
}

export function readGithubTokenFile(path = githubTokenFile) {
  try {
    return normalizeGithubToken(readFileSync(path, 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return '';
    }
    throw error;
  }
}

export async function resolveGithubToken(options = {}) {
  const env = options.env ?? process.env;
  const readFileToken = options.readFileToken ?? (() => readGithubTokenFile());
  const runCommandFn = options.runCommandFn ?? runCommand;

  const envToken = normalizeGithubToken(
    env.AUTOMATION_GITHUB_TOKEN || env.GITHUB_TOKEN || env.GH_TOKEN,
  );
  if (envToken) {
    return { token: envToken, source: 'env' };
  }

  const fileToken = normalizeGithubToken(readFileToken());
  if (fileToken) {
    return { token: fileToken, source: 'file' };
  }

  const ghTokenResult = await runCommandFn('gh', ['auth', 'token']);
  const ghToken = normalizeGithubToken(ghTokenResult.stdout);
  if (ghTokenResult.code === 0 && ghToken) {
    return { token: ghToken, source: 'gh-auth' };
  }

  return { token: '', source: '' };
}
