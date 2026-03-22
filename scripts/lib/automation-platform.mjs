import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const repoRoot = resolve(__dirname, '..', '..');
export const automationDir = join(repoRoot, '.automation');
export const jobsDir = join(automationDir, 'jobs');
export const contextDir = join(automationDir, 'context');
export const reportsDir = join(repoRoot, 'docs', 'automation');

mkdirSync(automationDir, { recursive: true });
mkdirSync(jobsDir, { recursive: true });
mkdirSync(contextDir, { recursive: true });
mkdirSync(reportsDir, { recursive: true });

export function validatePathInside(baseDir, relativePath) {
  const normalizedBaseDir = resolve(baseDir);
  const resolvedPath = resolve(normalizedBaseDir, relativePath);
  const relativePathFromBase = relative(normalizedBaseDir, resolvedPath);
  if (
    relativePathFromBase === '..' ||
    relativePathFromBase.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) ||
    isAbsolute(relativePathFromBase)
  ) {
    throw new Error('Invalid path outside allowed base directory');
  }
  return resolvedPath;
}

export function validateReportPath(relativePath) {
  return validatePathInside(reportsDir, relativePath);
}

export function sanitizeContextKey(key) {
  if (!/^[a-z0-9][a-z0-9._-]{0,127}$/i.test(key)) {
    throw new Error('Invalid context key');
  }
  return key;
}

export function contextPathForKey(key) {
  return validatePathInside(contextDir, `${sanitizeContextKey(key)}.json`);
}

export function readContext(key) {
  const contextPath = contextPathForKey(key);
  if (!existsSync(contextPath)) {
    return null;
  }

  return JSON.parse(readFileSync(contextPath, 'utf8'));
}

function serializeContext(key, value) {
  return JSON.stringify(
    {
      key: sanitizeContextKey(key),
      updatedAt: new Date().toISOString(),
      value,
    },
    null,
    2,
  );
}

function writeContextAtomically(key, value) {
  const contextPath = contextPathForKey(key);
  const tempPath = `${contextPath}.${process.pid}.tmp`;
  writeFileSync(tempPath, serializeContext(key, value));
  renameSync(tempPath, contextPath);
}

function sleepSync(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function withContextLock(key, action, options = {}) {
  const retries = options.retries ?? 5;
  const baseDelayMs = options.baseDelayMs ?? 25;
  const lockPath = `${contextPathForKey(key)}.lock`;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      mkdirSync(lockPath);
      try {
        return action();
      } finally {
        rmSync(lockPath, { recursive: true, force: true });
      }
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      sleepSync(baseDelayMs * (attempt + 1));
    }
  }

  throw new Error(`Could not acquire context lock for ${key}`);
}

export function writeContext(key, value) {
  writeContextAtomically(key, value);
  return readContext(key);
}

export function updateContext(key, updater, options = {}) {
  return withContextLock(key, () => {
    const currentValue = readContext(key)?.value ?? null;
    const nextValue = updater(currentValue);
    writeContextAtomically(key, nextValue);
    return readContext(key);
  }, options);
}

export function listContext() {
  return readdirSync(contextDir)
    .filter((entry) => entry.endsWith('.json'))
    .map((entry) => entry.replace(/\.json$/, ''))
    .sort()
    .map((key) => readContext(key))
    .filter(Boolean);
}

export function writeReport(relativePath, content) {
  const destination = validateReportPath(relativePath);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, content, 'utf8');
  return destination;
}

export function readJsonRequest(req) {
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

export function runCommand(command, args, options = {}) {
  return new Promise((resolveRun) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? repoRoot,
      env: options.env ?? process.env,
      detached: options.detached ?? false,
      stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on('close', (code) => {
      resolveRun({ code: code ?? 1, stdout, stderr });
    });

    child.on('error', (error) => {
      resolveRun({
        code: 1,
        stdout,
        stderr: stderr ? `${stderr}\n${error.message}` : error.message,
      });
    });
  });
}

async function httpHealth(url) {
  try {
    const response = await fetch(url);
    return {
      ok: response.ok,
      status: response.status,
      url,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function processHealth(matchText) {
  const result = await runCommand('pgrep', ['-af', matchText]);
  const lines = result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    ok: result.code === 0 && lines.length > 0,
    processMatch: matchText,
    matches: lines,
  };
}

function listFilesRecursively(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      return listFilesRecursively(entryPath);
    }
    if (entry.isFile()) {
      return [entryPath];
    }
    return [];
  });
}

function latestReportSnapshot(relativeDirectory) {
  const absoluteDirectory = join(reportsDir, relativeDirectory);
  const files = listFilesRecursively(absoluteDirectory);
  if (files.length === 0) {
    return {
      exists: false,
      latestReportPath: null,
      latestReportAt: null,
      ageHours: null,
    };
  }

  const latestFile = files
    .map((filePath) => ({
      filePath,
      mtimeMs: statSync(filePath).mtimeMs,
    }))
    .sort((left, right) => right.mtimeMs - left.mtimeMs)[0];

  const ageHours = (Date.now() - latestFile.mtimeMs) / (1000 * 60 * 60);
  return {
    exists: true,
    latestReportPath: relative(repoRoot, latestFile.filePath),
    latestReportAt: new Date(latestFile.mtimeMs).toISOString(),
    ageHours: Number(ageHours.toFixed(2)),
  };
}

async function loadN8nWorkflowStates(workflowIds) {
  const databasePath = join(homedir(), '.n8n', 'database.sqlite');
  if (!existsSync(databasePath)) {
    return {
      available: false,
      error: `n8n database not found at ${databasePath}`,
      states: {},
    };
  }

  const quotedIds = workflowIds.map((id) => `'${id.replace(/'/g, "''")}'`).join(',');
  const query = `select id,active from workflow_entity where id in (${quotedIds}) order by id;`;
  const databaseUrl = `file:${databasePath}?mode=ro&immutable=1`;
  const result = await runCommand('sqlite3', [databaseUrl, query]);

  if (result.code !== 0) {
    return {
      available: false,
      error: result.stderr.trim() || result.stdout.trim() || 'Unknown sqlite error',
      states: {},
    };
  }

  const states = Object.fromEntries(
    result.stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [id, active] = line.split('|');
        return [id, active === '1'];
      }),
  );

  return {
    available: true,
    error: null,
    states,
  };
}

async function getDeliveryLockHealth() {
  const lockPath = join(automationDir, 'delivery-lock.json');
  if (!existsSync(lockPath)) {
    return {
      ok: true,
      present: false,
      stale: false,
      safeToAutoClear: false,
      details: null,
    };
  }

  let lock;
  try {
    lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  } catch (error) {
    return {
      ok: false,
      present: true,
      stale: true,
      safeToAutoClear: false,
      details: {
        path: relative(repoRoot, lockPath),
        error: error instanceof Error ? error.message : 'Could not parse delivery lock',
      },
    };
  }

  const branch = typeof lock.branch === 'string' ? lock.branch : '';
  const timestamps = [lock.publishedAt, lock.implementedAt, lock.preparedAt]
    .filter((value) => typeof value === 'string' && value.length > 0)
    .map((value) => Date.parse(value))
    .filter((value) => Number.isFinite(value));
  const lastTouchedMs = timestamps.length > 0 ? Math.max(...timestamps) : statSync(lockPath).mtimeMs;
  const ageHours = Number(((Date.now() - lastTouchedMs) / (1000 * 60 * 60)).toFixed(2));

  let branchMergedIntoMain = false;
  if (branch) {
    const mergeBase = await runCommand('git', ['merge-base', '--is-ancestor', branch, 'main']);
    branchMergedIntoMain = mergeBase.code === 0;
  }

  const staleThresholdHours = Number(process.env.DELIVERY_LOCK_MAX_AGE_HOURS || '12');
  const stale = branchMergedIntoMain || ageHours >= staleThresholdHours;

  return {
    ok: !stale,
    present: true,
    stale,
    safeToAutoClear: branchMergedIntoMain,
    details: {
      ...lock,
      path: relative(repoRoot, lockPath),
      branchMergedIntoMain,
      ageHours,
      staleThresholdHours,
      lastTouchedAt: new Date(lastTouchedMs).toISOString(),
    },
  };
}

async function getProjectAutomationHealth() {
  const workflowSpecs = [
    { id: 'DpSmryDurable03', reportDir: 'daily-plane-summaries', maxAgeHours: 36 },
    { id: 'PlnBklgAudit02', reportDir: 'backlog-audits', maxAgeHours: 36 },
    { id: 'PlnTaskExpand01', reportDir: 'plane-task-expansions', maxAgeHours: 36 },
    { id: 'ProjAutoMaint01', reportDir: 'maintenance', maxAgeHours: 36 },
    { id: 'PlnStaleTask01', reportDir: 'stale-tasks', maxAgeHours: 36 },
    { id: 'PlnGuardedDelivery01', reportDir: 'delivery-runs', maxAgeHours: 12 },
  ];

  const workflowStates = await loadN8nWorkflowStates(workflowSpecs.map((spec) => spec.id));
  const workflows = workflowSpecs.map((spec) => {
    const snapshot = latestReportSnapshot(spec.reportDir);
    const active = workflowStates.states[spec.id];
    const fresh = Boolean(snapshot.latestReportAt) && Number(snapshot.ageHours ?? Number.POSITIVE_INFINITY) <= spec.maxAgeHours;
    return {
      id: spec.id,
      active: active ?? null,
      latestReportPath: snapshot.latestReportPath,
      latestReportAt: snapshot.latestReportAt,
      ageHours: snapshot.ageHours,
      maxAgeHours: spec.maxAgeHours,
      ok: active === true && fresh,
    };
  });

  const deliveryLock = await getDeliveryLockHealth();
  const failingChecks = [
    ...workflows.filter((workflow) => !workflow.ok).map((workflow) => workflow.id),
    ...(deliveryLock.ok ? [] : ['delivery-lock']),
  ];

  return {
    ok: failingChecks.length === 0,
    restartable: false,
    details: {
      workflowStateSource: workflowStates.available ? 'n8n-sqlite' : 'unavailable',
      workflowStateError: workflowStates.error,
      workflows,
      deliveryLock,
    },
  };
}

export async function getRepoStatus() {
  const branch = (await runCommand('git', ['branch', '--show-current'])).stdout.trim();
  const status = (await runCommand('git', ['status', '--porcelain'])).stdout.trim();
  const aheadRaw = await runCommand('git', ['rev-list', '--left-right', '--count', 'origin/main...HEAD']);
  const [behindCount, aheadCount] = aheadRaw.stdout
    .trim()
    .split(/\s+/)
    .map((value) => Number(value || '0'));
  const latestCommit = (await runCommand('git', ['log', '-1', '--pretty=%s'])).stdout.trim();

  let pr = null;
  const prView = await runCommand('bash', [
    './scripts/with-repo-env.sh',
    'gh',
    'pr',
    'view',
    '--json',
    'number,url,title,reviewDecision,mergeStateStatus',
  ]);
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

export async function getServiceHealth() {
  const [runnerHealth, ollamaHttp, ollamaProcess, n8nHttp, dockerProcess, repoStatus, projectAutomation] = await Promise.all([
    httpHealth(`http://127.0.0.1:${process.env.AUTOMATION_RUNNER_PORT || '3210'}/health`),
    httpHealth('http://127.0.0.1:11434/api/tags'),
    processHealth('ollama'),
    httpHealth('http://127.0.0.1:5678/'),
    processHealth('docker'),
    getRepoStatus(),
    getProjectAutomationHealth(),
  ]);

  const services = {
    automationRunner: {
      ok: runnerHealth.ok,
      details: runnerHealth,
      restartable: false,
    },
    ollama: {
      ok: ollamaHttp.ok || ollamaProcess.ok,
      details: { http: ollamaHttp, process: ollamaProcess },
      restartable: true,
    },
    n8n: {
      ok: n8nHttp.ok || dockerProcess.ok,
      details: { http: n8nHttp, docker: dockerProcess },
      restartable: true,
    },
    git: {
      ok: Boolean(repoStatus.branch),
      details: repoStatus,
      restartable: false,
    },
    projectAutomation: {
      ok: projectAutomation.ok,
      details: projectAutomation.details,
      restartable: projectAutomation.restartable,
    },
  };

  const failingServices = Object.entries(services)
    .filter(([, value]) => !value.ok)
    .map(([key]) => key);

  return {
    checkedAt: new Date().toISOString(),
    ok: failingServices.length === 0,
    failingServices,
    services,
  };
}
