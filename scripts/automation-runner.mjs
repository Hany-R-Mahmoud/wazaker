#!/usr/bin/env node

import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  getRepoStatus,
  getServiceHealth,
  jobsDir,
  listContext,
  readContext,
  readJsonRequest,
  repoRoot,
  runCommand,
  validateReportPath,
  writeContext,
} from './lib/automation-platform.mjs';

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
  pr_sweep_open: ['node', './scripts/pr-open-sweep.mjs'],
  github_pr_comment: ['bash', './scripts/github-pr-comment.sh'],
  delivery_prepare_task: ['bash', './scripts/delivery-prepare-task.sh'],
  delivery_implement_task: ['bash', './scripts/delivery-implement-task.sh'],
  delivery_publish_task: ['bash', './scripts/delivery-publish-task.sh'],
  plane_sync_backlog: ['bash', './scripts/plane-sync-backlog.sh'],
  plane_dedupe_backlog: ['bash', './scripts/plane-dedupe-backlog.sh'],
  main_sync: ['bash', './scripts/main-sync.sh'],
  service_health_report: ['node', './scripts/service-health-report.mjs'],
  restart_service: ['node', './scripts/restart-service.mjs'],
  codebase_map_refresh: ['node', './scripts/codebase-map.mjs'],
  speech_qa_report: ['node', './scripts/speech-qa-report.mjs'],
  ui_consistency_report: ['node', './scripts/ui-consistency-report.mjs'],
};

const activeJobs = new Map();

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
  if (dedupeKey) {
    activeJobs.set(dedupeKey, initialState);
  }

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
    if (dedupeKey) {
      activeJobs.delete(dedupeKey);
    }
  });

  return initialState;
}

const server = createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host}`);

    if (req.method === 'GET' && requestUrl.pathname === '/health') {
      sendJson(res, 200, { ok: true, port });
      return;
    }

    if (token && req.headers.authorization !== `Bearer ${token}`) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return;
    }

    if (req.method === 'GET' && requestUrl.pathname === '/repo/status') {
      sendJson(res, 200, await getRepoStatus());
      return;
    }

    if (req.method === 'GET' && requestUrl.pathname === '/services/health') {
      sendJson(res, 200, await getServiceHealth());
      return;
    }

    if (req.method === 'GET' && requestUrl.pathname === '/context') {
      sendJson(res, 200, { items: listContext() });
      return;
    }

    if ((req.method === 'GET' || req.method === 'PUT') && requestUrl.pathname.startsWith('/context/')) {
      const key = requestUrl.pathname.split('/').pop();
      if (!key) {
        sendJson(res, 400, { error: 'Missing context key' });
        return;
      }

      if (req.method === 'GET') {
        const item = readContext(key);
        if (!item) {
          sendJson(res, 404, { error: 'Context key not found' });
          return;
        }
        sendJson(res, 200, item);
        return;
      }

      const body = await readJsonRequest(req);
      if (!Object.prototype.hasOwnProperty.call(body, 'value')) {
        sendJson(res, 400, { error: 'Missing value' });
        return;
      }
      sendJson(res, 200, writeContext(key, body.value));
      return;
    }

    if (req.method === 'POST' && requestUrl.pathname === '/jobs') {
      const body = await readJsonRequest(req);
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
      const body = await readJsonRequest(req);
      const relativePath = String(body.relativePath || '').trim();
      const content = String(body.content || '');
      if (!relativePath) {
        sendJson(res, 400, { error: 'Missing relativePath' });
        return;
      }
      const destination = validateReportPath(relativePath);
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
