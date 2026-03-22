#!/usr/bin/env node

import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  readContext,
  repoRoot,
  runCommand,
  writeContext,
  writeReport,
} from './lib/automation-platform.mjs';
import { resolveGithubToken } from './lib/github-token.mjs';
import { evaluateOpenPullRequest } from './lib/pr-sweep.mjs';

const prSweepBlockerContextKey = 'pr-sweep-blockers';

function loadSweepBlockers() {
  const context = readContext(prSweepBlockerContextKey);
  const blockers = context?.value;
  if (!blockers || typeof blockers !== 'object' || Array.isArray(blockers)) {
    return {};
  }
  return blockers;
}

function blockerKeyForPr(prNumber) {
  return `pr-${prNumber}`;
}

function pruneClosedBlockers(blockers, openPullNumbers) {
  const openKeys = new Set(openPullNumbers.map((number) => blockerKeyForPr(number)));
  return Object.fromEntries(
    Object.entries(blockers).filter(([key]) => openKeys.has(key)),
  );
}

function persistSweepBlockers(blockers, openPullNumbers) {
  const current = pruneClosedBlockers(loadSweepBlockers(), openPullNumbers);
  const next = { ...current };
  for (const prNumber of openPullNumbers) {
    delete next[blockerKeyForPr(prNumber)];
  }
  for (const [key, value] of Object.entries(blockers)) {
    next[key] = value;
  }

  writeContext(prSweepBlockerContextKey, next);
}

function updateSweepBlocker(blockers, pr, result) {
  const nextBlockers = { ...blockers };
  const key = blockerKeyForPr(pr.number);
  const now = new Date().toISOString();
  const existing = blockers[key];

  if (result.status === 'blocked') {
    nextBlockers[key] = {
      prNumber: pr.number,
      branch: pr.branch,
      headSha: pr.headSha,
      manualActionRequired: true,
      blockedAt: existing?.headSha === pr.headSha ? (existing.blockedAt ?? now) : now,
      stopReason: result.stopReason || result.stderr || 'PR sweep blocked and requires manual inspection.',
      source: 'pr-open-sweep',
      lastAttemptedAt: now,
    };
    return nextBlockers;
  }

  delete nextBlockers[key];
  return nextBlockers;
}

function parseOriginRepo(remoteUrl) {
  const normalized = String(remoteUrl || '').trim();
  const sshMatch = normalized.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
  if (sshMatch) {
    return { owner: sshMatch[1], name: sshMatch[2] };
  }
  throw new Error(`Could not parse origin remote URL: ${normalized}`);
}

async function githubRequest(pathname, githubToken) {
  const controller = new AbortController();
  const timeoutMs = Number(process.env.GITHUB_REQUEST_TIMEOUT_MS || 10000);
  const timeoutHandle = setTimeout(() => controller.abort(new Error(`GitHub API request timed out after ${timeoutMs}ms`)), timeoutMs);
  let response;
  try {
    response = await fetch(`https://api.github.com${pathname}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${githubToken}`,
        'User-Agent': 'wazaker-pr-sweep',
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      const reason = controller.signal.reason instanceof Error ? controller.signal.reason.message : 'GitHub API request timed out';
      throw new Error(`${reason}: ${pathname}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${typeof json === 'string' ? json : JSON.stringify(json)}`);
  }

  return json;
}

async function githubRequestAll(pathname, { githubToken, perPage = 100 } = {}) {
  const separator = pathname.includes('?') ? '&' : '?';
  const items = [];

  for (let page = 1; ; page += 1) {
    const requestPath = `${pathname}${separator}per_page=${perPage}&page=${page}`;
    const json = await githubRequest(requestPath, githubToken);
    if (!Array.isArray(json)) {
      return json;
    }

    items.push(...json);
    if (json.length < perPage) {
      return items;
    }
  }
}

function sanitizeBranchName(branchName) {
  return String(branchName).replace(/[^a-zA-Z0-9._/-]+/g, '-');
}

async function allowWorktreeDirenv(worktreeDir) {
  const direnvExists = await runCommand('direnv', ['version']);
  if (direnvExists.code !== 0) {
    return;
  }

  const allowResult = await runCommand('direnv', ['allow', worktreeDir], {
    cwd: worktreeDir,
  });
  if (allowResult.code !== 0) {
    throw new Error(`Could not allow direnv for ${worktreeDir}: ${allowResult.stderr || allowResult.stdout}`);
  }
}

async function cleanupSweepBranch(worktreeDir, localBranch) {
  let removeResult = await runCommand('git', ['worktree', 'remove', '--force', worktreeDir]);
  if (removeResult.code !== 0) {
    await runCommand('git', ['worktree', 'prune']);
    removeResult = await runCommand('git', ['worktree', 'remove', '--force', worktreeDir]);
    if (removeResult.code !== 0) {
      throw new Error(`Could not remove worktree ${worktreeDir}: ${removeResult.stderr || removeResult.stdout}`);
    }
  }
  const branchExists = await runCommand('git', ['rev-parse', '--verify', localBranch]);
  if (branchExists.code === 0) {
    const deleteResult = await runCommand('git', ['branch', '-D', localBranch]);
    if (deleteResult.code !== 0) {
      throw new Error(`Could not delete local branch ${localBranch}: ${deleteResult.stderr || deleteResult.stdout}`);
    }
  }
  rmSync(worktreeDir, { recursive: true, force: true });
}

async function sweepPullRequest(pr) {
  const branchSuffix = sanitizeBranchName(pr.branch).replace(/\//g, '-');
  const localBranch = `automation/pr-${pr.number}-${branchSuffix}`;
  const worktreeDir = join(repoRoot, '.tmp', 'pr-sweep', String(pr.number));

  mkdirSync(join(repoRoot, '.tmp', 'pr-sweep'), { recursive: true });
  rmSync(worktreeDir, { recursive: true, force: true });

  const branchExists = await runCommand('git', ['rev-parse', '--verify', localBranch]);
  if (branchExists.code === 0) {
    const deleteResult = await runCommand('git', ['branch', '-D', localBranch]);
    if (deleteResult.code !== 0) {
      throw new Error(`Could not delete local branch ${localBranch}: ${deleteResult.stderr || deleteResult.stdout}`);
    }
  }
  const fetchResult = await runCommand('git', ['fetch', 'origin', `${pr.branch}:${localBranch}`]);
  if (fetchResult.code !== 0) {
    throw new Error(`Could not fetch branch ${pr.branch}: ${fetchResult.stderr || fetchResult.stdout}`);
  }

  const addResult = await runCommand('git', ['worktree', 'add', worktreeDir, localBranch]);
  if (addResult.code !== 0) {
    throw new Error(`Could not create worktree: ${addResult.stderr || addResult.stdout}`);
  }

  try {
    await allowWorktreeDirenv(worktreeDir);
    await runCommand('git', ['branch', '--set-upstream-to', `origin/${pr.branch}`, localBranch], { cwd: worktreeDir });
    const result = await runCommand('bash', ['./scripts/pr-autofinish.sh', String(pr.number)], {
      cwd: worktreeDir,
      env: {
        ...process.env,
        GH_TOKEN: pr.githubToken,
        GITHUB_TOKEN: pr.githubToken,
      },
    });

    return {
      number: pr.number,
      branch: pr.branch,
      headSha: pr.headSha,
      title: pr.title,
      url: pr.url,
      status: result.code === 0 ? 'merged-or-clean' : 'blocked',
      exitCode: result.code,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
      stopReason: result.code === 0 ? '' : (result.stderr.trim() || result.stdout.trim() || 'PR autofinish failed.'),
    };
  } finally {
    await cleanupSweepBranch(worktreeDir, localBranch);
  }
}

export async function main() {
  const { token: githubToken, source: githubTokenSource } = await resolveGithubToken();
  if (!githubToken) {
    throw new Error(
      'GitHub PR sweep requires unattended GitHub auth. Configure AUTOMATION_GITHUB_TOKEN or .automation/github.token.',
    );
  }

  const remoteUrl = (await runCommand('git', ['config', '--get', 'remote.origin.url'])).stdout.trim();
  const repo = parseOriginRepo(remoteUrl);
  const pulls = await githubRequestAll(`/repos/${repo.owner}/${repo.name}/pulls?state=open`, {
    githubToken,
  });
  const openPullNumbers = pulls.map((pr) => pr.number);
  let blockers = pruneClosedBlockers(loadSweepBlockers(), openPullNumbers);
  const evaluatedPulls = pulls.map((pr) => ({
    pr,
    evaluation: evaluateOpenPullRequest(pr, repo.owner, {
      blocker: blockers[blockerKeyForPr(pr.number)] ?? null,
    }),
  }));
  const candidates = evaluatedPulls
    .filter(({ evaluation }) => evaluation.eligible)
    .map(({ pr, evaluation }) => ({
      ...evaluation,
      headSha: evaluation.headSha || pr?.head?.sha || null,
      pr,
      githubToken,
    }));
  const skipped = evaluatedPulls
    .filter(({ evaluation }) => !evaluation.eligible)
    .map(({ pr, evaluation }) => ({
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      ...evaluation,
    }));

  const results = [];
  for (const candidate of candidates) {
    try {
      const result = await sweepPullRequest(candidate);
      results.push(result);
      blockers = updateSweepBlocker(blockers, candidate, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`Failed to sweep PR #${candidate.number}: ${message}\n`);
      const result = {
        number: candidate.number,
        branch: candidate.branch,
        headSha: candidate.headSha,
        title: candidate.title,
        url: candidate.url,
        status: 'blocked',
        exitCode: null,
        stdout: '',
        stderr: message,
        stopReason: message,
      };
      results.push(result);
      blockers = updateSweepBlocker(blockers, candidate, result);
    }
  }
  persistSweepBlockers(blockers, openPullNumbers);

  const timestamp = new Date().toISOString().replace(/[:]/g, '-');
  const reportRelativePath = `github-pr-sweeps/${timestamp}.md`;
  const reportContent = [
    '# Open PR Sweep',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Repository: ${repo.owner}/${repo.name}`,
    `GitHub token source: ${githubTokenSource}`,
    '',
    '## Eligible PRs',
    '',
    candidates.length === 0
      ? 'No eligible PRs were found.'
      : results.map((result) => [
          `### PR #${result.number}: ${result.title}`,
          '',
          `- Branch: \`${result.branch}\``,
          `- URL: ${result.url}`,
          `- Status: ${result.status}`,
          `- Exit code: ${result.exitCode}`,
          result.stdout ? `- stdout: \`${result.stdout.replace(/\n+/g, ' ').slice(0, 400)}\`` : '',
          result.stderr ? `- stderr: \`${result.stderr.replace(/\n+/g, ' ').slice(0, 400)}\`` : '',
        ].filter(Boolean).join('\n')).join('\n\n'),
    '',
    '## Skipped PRs',
    '',
    skipped.length === 0
      ? 'No PRs were skipped.'
      : skipped.map((item) => `- PR #${item.number}: ${item.title} (${item.reason})`).join('\n'),
  ].join('\n');

  writeReport(reportRelativePath, reportContent);

  return {
    generatedAt: new Date().toISOString(),
    repo,
    githubTokenSource,
    candidateCount: candidates.length,
    skippedCount: skipped.length,
    results,
    skipped,
    reportRelativePath,
  };
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
      process.exit(1);
    });
}
