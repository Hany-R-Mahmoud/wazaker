import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
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

export function writeContext(key, value) {
  const contextPath = contextPathForKey(key);
  writeFileSync(
    contextPath,
    JSON.stringify(
      {
        key: sanitizeContextKey(key),
        updatedAt: new Date().toISOString(),
        value,
      },
      null,
      2,
    ),
  );
  return readContext(key);
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
  const [runnerHealth, ollamaHttp, ollamaProcess, n8nHttp, dockerProcess, repoStatus] = await Promise.all([
    httpHealth(`http://127.0.0.1:${process.env.AUTOMATION_RUNNER_PORT || '3210'}/health`),
    httpHealth('http://127.0.0.1:11434/api/tags'),
    processHealth('ollama'),
    httpHealth('http://127.0.0.1:5678/'),
    processHealth('docker'),
    getRepoStatus(),
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
