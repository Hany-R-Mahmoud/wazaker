#!/usr/bin/env node

import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const automationDir = join(repoRoot, '.automation');
const jobsDir = join(automationDir, 'jobs');
const reportsDir = join(repoRoot, 'docs', 'automation');

mkdirSync(automationDir, { recursive: true });
mkdirSync(jobsDir, { recursive: true });
mkdirSync(reportsDir, { recursive: true });

const port = Number(process.env.AUTOMATION_RUNNER_PORT || '3210');
const token = process.env.AUTOMATION_RUNNER_TOKEN || '';

const actionMap = {
  pr_start: ['bash', './scripts/pr-start.sh'],
  pr_publish: ['bash', './scripts/pr-publish.sh'],
  pr_summary: ['bash', './scripts/pr-summary.sh'],
  pr_watch: ['bash', './scripts/pr-watch.sh'],
  pr_trigger_coderabbit: ['bash', './scripts/pr-trigger-coderabbit.sh'],
  pr_review_cycle: ['bash', './scripts/pr-review-cycle.sh'],
  pr_resolve_review: ['bash', './scripts/pr-resolve-review.sh'],
  pr_thread_sync: ['bash', './scripts/pr-thread-sync.sh'],
  pr_check_unresolved: ['bash', './scripts/pr-check-unresolved.sh'],
  pr_autofinish: ['bash', './scripts/pr-autofinish.sh'],
  pr_merge: ['bash', './scripts/pr-merge.sh'],
  delivery_prepare_task: ['bash', './scripts/delivery-prepare-task.sh'],
  delivery_implement_task: ['bash', './scripts/delivery-implement-task.sh'],
  delivery_publish_task: ['bash', './scripts/delivery-publish-task.sh'],
  plane_sync_backlog: ['bash', './scripts/plane-sync-backlog.sh'],
  plane_dedupe_backlog: ['bash', './scripts/plane-dedupe-backlog.sh'],
  main_sync: ['bash', './scripts/main-sync.sh'],
};

const activeJobs = new Map();

function readJson(req) {
  return new Promise((resolveJson, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolveJson({});
        return;
      }
      try {
        resolveJson(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function appendJobState(jobId, state) {
  writeFileSync(join(jobsDir, `${jobId}.json`), JSON.stringify(state, null, 2));
}

function runCommand(command, args) {
  return new Promise((resolveRun) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      resolveRun({ code: code ?? 1, stdout, stderr });
    });
  });
}

async function getRepoStatus() {
  const branch = (await runCommand('git', ['branch', '--show-current'])).stdout.trim();
  const status = (await runCommand('git', ['status', '--porcelain'])).stdout.trim();
  const aheadRaw = await runCommand('git', ['rev-list', '--left-right', '--count', `origin/main...HEAD`]);
  const [behindCount, aheadCount] = aheadRaw.stdout.trim().split(/\s+/).map((value) => Number(value || '0'));
  const latestCommit = (await runCommand('git', ['log', '-1', '--pretty=%s'])).stdout.trim();

  let pr = null;
  const prView = await runCommand('bash', ['./scripts/with-repo-env.sh', 'gh', 'pr', 'view', '--json', 'number,url,title,reviewDecision,mergeStateStatus']);
  if (prView.code === 0 && prView.stdout.trim()) {
    try {
      pr = JSON.parse(prView.stdout);
    } catch {
      pr = null;
    }
  }

  return {
    branch,
    clean: status.length === 0,
    aheadCount,
    behindCount,
    latestCommit,
    pr,
  };
}

function validatePath(relativePath) {
  const resolvedPath = resolve(reportsDir, relativePath);
  if (!resolvedPath.startsWith(reportsDir)) {
    throw new Error('Invalid report path');
  }
  return resolvedPath;
}

async function startJob(action, args = [], dedupeKey = '') {
  const mapped = actionMap[action];
  if (!mapped) {
    throw new Error(`Unsupported action: ${action}`);
  }

  if (dedupeKey && activeJobs.has(dedupeKey)) {
    return activeJobs.get(dedupeKey);
  }

  const jobId = randomUUID();
  const [command, ...baseArgs] = mapped;
  const fullArgs = [...baseArgs, ...args.map(String)];
  const startedAt = new Date().toISOString();

  const initialState = {
    jobId,
    action,
    args,
    dedupeKey,
    status: 'running',
    startedAt,
    finishedAt: null,
    exitCode: null,
    stdout: '',
    stderr: '',
  };
  appendJobState(jobId, initialState);
  if (dedupeKey) activeJobs.set(dedupeKey, initialState);

  runCommand(command, fullArgs).then((result) => {
    const finalState = {
      ...initialState,
      status: result.code === 0 ? 'completed' : 'failed',
      finishedAt: new Date().toISOString(),
      exitCode: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
    };
    appendJobState(jobId, finalState);
    if (dedupeKey) activeJobs.delete(dedupeKey);
  });

  return initialState;
}

const server = createServer(async (req, res) => {
  try {
    if (token && req.headers.authorization !== `Bearer ${token}`) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    const requestUrl = new URL(req.url || '/', `http://${req.headers.host}`);

    if (req.method === 'GET' && requestUrl.pathname === '/health') {
      sendJson(res, 200, { ok: true, port });
      return;
    }

    if (req.method === 'GET' && requestUrl.pathname === '/repo/status') {
      sendJson(res, 200, await getRepoStatus());
      return;
    }

    if (req.method === 'POST' && requestUrl.pathname === '/jobs') {
      const body = await readJson(req);
      const action = String(body.action || '');
      const args = Array.isArray(body.args) ? body.args : [];
      const dedupeKey = typeof body.dedupeKey === 'string' ? body.dedupeKey : '';
      const mode = body.mode === 'sync' ? 'sync' : 'async';

      if (!action) {
        sendJson(res, 400, { error: 'Missing action' });
        return;
      }

      if (mode === 'sync') {
        const mapped = actionMap[action];
        if (!mapped) {
          sendJson(res, 400, { error: `Unsupported action: ${action}` });
          return;
        }
        const [command, ...baseArgs] = mapped;
        const result = await runCommand(command, [...baseArgs, ...args.map(String)]);
        sendJson(res, result.code === 0 ? 200 : 500, {
          action,
          args,
          exitCode: result.code,
          stdout: result.stdout,
          stderr: result.stderr,
        });
        return;
      }

      const jobState = await startJob(action, args, dedupeKey);
      sendJson(res, 202, jobState);
      return;
    }

    if (req.method === 'GET' && requestUrl.pathname.startsWith('/jobs/')) {
      const jobId = requestUrl.pathname.split('/').pop();
      const jobFile = join(jobsDir, `${jobId}.json`);
      if (!jobId || !existsSync(jobFile)) {
        sendJson(res, 404, { error: 'Job not found' });
        return;
      }
      sendJson(res, 200, JSON.parse(readFileSync(jobFile, 'utf8')));
      return;
    }

    if (req.method === 'POST' && requestUrl.pathname === '/reports/write') {
      const body = await readJson(req);
      const relativePath = String(body.relativePath || '').trim();
      const content = String(body.content || '');
      if (!relativePath) {
        sendJson(res, 400, { error: 'Missing relativePath' });
        return;
      }
      const destination = validatePath(relativePath);
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, content, 'utf8');
      sendJson(res, 200, {
        ok: true,
        relativePath,
      });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`automation-runner listening on http://127.0.0.1:${port}\n`);
});
