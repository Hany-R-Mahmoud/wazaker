const BOT_ALIASES = ['coderabbit', 'qodo'];
const PENDING_PATTERNS = [
  'waiting for status to be reported',
  'review in progress',
  'in_progress',
  'pending',
  'queued',
];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value) {
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  if (value === null || value === undefined) {
    return '';
  }
  try {
    return JSON.stringify(value).toLowerCase();
  } catch {
    return String(value).toLowerCase();
  }
}

function includesBotAlias(value) {
  const normalized = normalizeText(value);
  return BOT_ALIASES.some((alias) => normalized.includes(alias));
}

function parseTimestamp(value) {
  const epoch = Date.parse(String(value || ''));
  return Number.isFinite(epoch) ? epoch : null;
}

function collectBotAuthors(prStatus) {
  const authors = [
    ...asArray(prStatus?.latestReviews).map((review) => review?.author?.login),
    ...asArray(prStatus?.reviews).map((review) => review?.author?.login),
    ...asArray(prStatus?.comments).map((comment) => comment?.author?.login),
  ].filter(Boolean);

  const uniqueAuthors = [];
  const seenAuthors = new Set();

  for (const author of authors) {
    if (!includesBotAlias(author) || seenAuthors.has(author)) {
      continue;
    }
    seenAuthors.add(author);
    uniqueAuthors.push(author);
  }

  return uniqueAuthors;
}

function collectPendingSignals(prStatus) {
  const signals = new Set();
  const rollup = normalizeText(prStatus?.statusCheckRollup);
  const latestReviewEpochByAuthor = new Map();

  // `statusCheckRollup` can arrive as an opaque blob instead of structured checks.
  // We intentionally fail closed here: any pending signal near a known bot alias
  // blocks merge until the explicit actionable-thread pass says the PR is clear.
  for (const alias of BOT_ALIASES) {
    if (!rollup.includes(alias)) {
      continue;
    }
    for (const pattern of PENDING_PATTERNS) {
      if (rollup.includes(pattern)) {
        signals.add(`${alias}:${pattern}`);
      }
    }
  }

  for (const review of [
    ...asArray(prStatus?.latestReviews),
    ...asArray(prStatus?.reviews),
  ]) {
    const author = normalizeText(review?.author?.login);
    const submittedAt = parseTimestamp(review?.submittedAt);
    if (!includesBotAlias(author) || submittedAt === null) {
      continue;
    }
    const currentLatest = latestReviewEpochByAuthor.get(author) ?? 0;
    if (submittedAt > currentLatest) {
      latestReviewEpochByAuthor.set(author, submittedAt);
    }
  }

  for (const comment of asArray(prStatus?.comments)) {
    const author = normalizeText(comment?.author?.login);
    const body = normalizeText(comment?.body);
    const createdAt = parseTimestamp(comment?.createdAt);
    if (!includesBotAlias(author)) {
      continue;
    }
    const latestReviewEpoch = latestReviewEpochByAuthor.get(author);
    if (createdAt !== null && latestReviewEpoch !== undefined && createdAt <= latestReviewEpoch) {
      continue;
    }
    for (const pattern of PENDING_PATTERNS) {
      if (body.includes(pattern)) {
        signals.add(`${author}:${pattern}`);
      }
    }
  }

  return [...signals];
}

export function evaluatePrReviewGate(prStatus, actionableBotComments, options = {}) {
  const requireBotActivity = options.requireBotActivity !== false;
  const botAuthors = collectBotAuthors(prStatus);
  const pendingSignals = collectPendingSignals(prStatus);
  const actionableBotThreadCount = asArray(actionableBotComments).length;
  const botActivitySeen = botAuthors.length > 0;
  const blockingBotReviewPending = pendingSignals.length > 0;
  const reasons = [];

  if (blockingBotReviewPending) {
    reasons.push('Bot review is still pending.');
  }
  if (requireBotActivity && !botActivitySeen) {
    reasons.push('No CodeRabbit/Qodo review activity detected yet.');
  }
  if (actionableBotThreadCount > 0) {
    reasons.push('Actionable bot review threads remain unresolved.');
  }

  return {
    requireBotActivity,
    botActivitySeen,
    blockingBotReviewPending,
    actionableBotThreadCount,
    pendingSignals,
    botAuthors,
    mergeStateStatus: prStatus?.mergeStateStatus ?? 'unknown',
    reviewDecision: prStatus?.reviewDecision ?? 'none',
    clearToMerge: reasons.length === 0,
    reasons,
  };
}
