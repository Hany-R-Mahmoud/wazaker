#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

import { getRepoStatus, runCommand } from './lib/automation-platform.mjs';
import { buildChangeSummary } from './lib/change-promotion.mjs';

function parseTrackedFilesFromStatus(statusOutput) {
  return statusOutput
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => line.slice(3))
    .map((entry) => {
      const parts = entry.split(' -> ');
      return parts.at(-1)?.trim() || '';
    })
    .filter(Boolean);
}

async function ensureSuccess(command, args, options = {}) {
  const result = await runCommand(command, args, options);
  if (result.code !== 0) {
    throw new Error(result.stderr || result.stdout || `${command} ${args.join(' ')} failed`);
  }
  return result;
}

async function branchExists(branchName) {
  const localResult = await runCommand('git', ['show-ref', '--verify', '--quiet', `refs/heads/${branchName}`]);
  if (localResult.code === 0) {
    return true;
  }

  const remoteResult = await runCommand('git', ['ls-remote', '--heads', 'origin', branchName]);
  return Boolean(remoteResult.stdout.trim());
}

async function buildUniqueBranchName(baseBranchName) {
  if (!(await branchExists(baseBranchName))) {
    return baseBranchName;
  }

  const maxAttempts = 100;
  let attempt = 0;
  while (attempt < maxAttempts) {
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 17);
    const suffix = attempt === 0 ? timestamp : `${timestamp}-${attempt}`;
    const candidateBranchName = `${baseBranchName}-${suffix}`;
    if (!(await branchExists(candidateBranchName))) {
      return candidateBranchName;
    }
    attempt += 1;
  }

  throw new Error(`Failed to generate unique branch name for ${baseBranchName} after ${maxAttempts} attempts`);
}

function extractPrUrl(output) {
  const match = String(output).match(/https:\/\/github\.com\/\S+/);
  return match ? match[0] : null;
}

async function fetchPullRequestMetadata(fallbackUrl = null) {
  const viewResult = await runCommand('bash', [
    './scripts/with-github-env.sh',
    'gh',
    'pr',
    'view',
    '--json',
    'number,url,title,reviewDecision,mergeStateStatus',
  ]);

  if (viewResult.code === 0 && viewResult.stdout.trim()) {
    try {
      return JSON.parse(viewResult.stdout);
    } catch (error) {
      const parseMessage = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Warning: could not parse gh pr view output: ${parseMessage}\n`);
      process.stderr.write(`${viewResult.stdout}\n`);
    }
  }

  return {
    number: null,
    url: fallbackUrl,
    title: null,
    reviewDecision: null,
    mergeStateStatus: null,
  };
}

export async function main() {
  const repoStatus = await getRepoStatus();
  if (repoStatus.branch !== 'main') {
    return {
      skipped: true,
      reason: 'not-on-main',
      repoStatus,
    };
  }

  const trackedStatus = await ensureSuccess('git', ['status', '--porcelain', '--untracked-files=no']);
  const changedFiles = Array.from(new Set(parseTrackedFilesFromStatus(trackedStatus.stdout)));

  if (changedFiles.length === 0) {
    return {
      skipped: true,
      reason: 'no-tracked-changes',
      repoStatus,
    };
  }

  const changeSummary = buildChangeSummary(changedFiles);
  const branchName = await buildUniqueBranchName(changeSummary.branchName);
  const branchSpecificSummary = {
    ...changeSummary,
    branchName,
  };

  let prBodyFile = '';
  let createdPrUrl = null;
  let branchCreated = false;
  let remoteBranchPushed = false;
  let prCreated = false;

  try {
    await ensureSuccess('git', ['checkout', '-b', branchName]);
    branchCreated = true;

    await ensureSuccess('git', ['add', '-u']);
    await ensureSuccess('git', ['commit', '-m', branchSpecificSummary.commitMessage]);

    prBodyFile = (await ensureSuccess('bash', ['./scripts/pr-summary.sh'])).stdout.trim();

    const authStatus = await runCommand('bash', ['./scripts/with-github-env.sh', 'gh', 'auth', 'status']);
    if (authStatus.code !== 0) {
      throw new Error('gh is not authenticated cleanly for automated PR creation.');
    }

    await ensureSuccess('git', ['push', '-u', 'origin', branchName]);
    remoteBranchPushed = true;

    const prCreateResult = await ensureSuccess('bash', [
      './scripts/with-github-env.sh',
      'gh',
      'pr',
      'create',
      '--fill',
      '--title',
      branchSpecificSummary.prTitle,
      '--body-file',
      prBodyFile,
    ]);
    createdPrUrl = extractPrUrl(prCreateResult.stdout);
    prCreated = Boolean(createdPrUrl);

    const pr = await fetchPullRequestMetadata(createdPrUrl);
    prCreated = prCreated || Boolean(pr?.number || pr?.url);
    await ensureSuccess('git', ['checkout', 'main']);

    return {
      skipped: false,
      changedFiles,
      ...branchSpecificSummary,
      prBodyFile,
      pr,
      repoStatusBefore: repoStatus,
      repoStatusAfter: await getRepoStatus(),
    };
  } catch (error) {
    if (remoteBranchPushed && !prCreated) {
      await runCommand('git', ['push', 'origin', '--delete', branchName]);
    }
    if (branchCreated) {
      await runCommand('git', ['checkout', 'main']);
    }
    throw error;
  }
}

const isEntrypoint = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  main()
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${message}\n`);
      process.exitCode = 1;
    });
}
