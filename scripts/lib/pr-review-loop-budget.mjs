import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function nowIso() {
  return new Date().toISOString();
}

export function createInitialState({
  prNumber = null,
  branchName = '',
  maxTriggerComments = 4,
  maxWatchTimeouts = 2,
} = {}) {
  return {
    version: 1,
    prNumber,
    branchName,
    maxTriggerComments,
    maxWatchTimeouts,
    triggerCommentCount: 0,
    watchTimeoutCount: 0,
    manualActionRequired: false,
    stopReason: '',
    lastTriggerCommentUrl: '',
    lastEvent: '',
    lastEventAt: '',
    history: [],
  };
}

export function sanitizeState(state, fallback = {}) {
  const initial = createInitialState(fallback);
  const base = state && typeof state === 'object' && !Array.isArray(state) ? state : {};

  return {
    ...initial,
    ...base,
    triggerCommentCount: Number(base.triggerCommentCount ?? initial.triggerCommentCount) || 0,
    watchTimeoutCount: Number(base.watchTimeoutCount ?? initial.watchTimeoutCount) || 0,
    maxTriggerComments: Number(base.maxTriggerComments ?? initial.maxTriggerComments) || initial.maxTriggerComments,
    maxWatchTimeouts: Number(base.maxWatchTimeouts ?? initial.maxWatchTimeouts) || initial.maxWatchTimeouts,
    manualActionRequired: Boolean(base.manualActionRequired ?? initial.manualActionRequired),
    history: Array.isArray(base.history) ? base.history : [],
  };
}

export function loadState(filePath, fallback = {}) {
  if (!existsSync(filePath)) {
    return createInitialState(fallback);
  }

  return sanitizeState(JSON.parse(readFileSync(filePath, 'utf8')), fallback);
}

export function saveState(filePath, state) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(state, null, 2)}\n`);
  renameSync(tempPath, filePath);
}

export function applyEvent(currentState, type, payload = {}) {
  const state = sanitizeState(currentState);
  const entry = {
    ...payload,
    type,
    at: nowIso(),
  };

  state.history = [...state.history, entry];
  state.lastEvent = type;
  state.lastEventAt = entry.at;

  switch (type) {
    case 'trigger':
      state.triggerCommentCount += 1;
      state.lastTriggerCommentUrl = String(payload.url || '');
      state.manualActionRequired = false;
      state.stopReason = '';
      break;
    case 'watch-timeout':
      state.watchTimeoutCount += 1;
      break;
    case 'watch-actionable':
    case 'watch-settled':
      state.manualActionRequired = false;
      state.stopReason = '';
      break;
    case 'blocked':
      state.manualActionRequired = true;
      state.stopReason = String(payload.reason || '');
      break;
    case 'clear':
      state.manualActionRequired = false;
      state.stopReason = '';
      break;
    default:
      break;
  }

  return state;
}

function main() {
  const [filePath, command, eventType, payloadRaw] = process.argv.slice(2);

  if (!filePath || !command) {
    console.error('Usage: node scripts/lib/pr-review-loop-budget.mjs <file> <ensure|event|show> [eventType] [jsonPayload]');
    process.exit(1);
  }

  const rawPayload = command === 'event' ? payloadRaw : eventType;
  const payload = rawPayload ? JSON.parse(rawPayload) : {};
  const fallback = {
    prNumber: payload.prNumber ?? null,
    branchName: payload.branchName ?? '',
    maxTriggerComments: payload.maxTriggerComments ?? 4,
    maxWatchTimeouts: payload.maxWatchTimeouts ?? 2,
  };
  const state = loadState(filePath, fallback);

  if (command === 'ensure') {
    const nextState = sanitizeState({ ...state, ...fallback }, fallback);
    saveState(filePath, nextState);
    process.stdout.write(`${JSON.stringify(nextState)}\n`);
    return;
  }

  if (command === 'event') {
    if (!eventType) {
      console.error('Missing event type.');
      process.exit(1);
    }
    const nextState = applyEvent(state, eventType, payload);
    saveState(filePath, nextState);
    process.stdout.write(`${JSON.stringify(nextState)}\n`);
    return;
  }

  if (command === 'show') {
    process.stdout.write(`${JSON.stringify(state)}\n`);
    return;
  }

  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
