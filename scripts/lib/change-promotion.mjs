const GENERIC_BASE_NAMES = new Set([
  'index',
  'readme',
  'main',
  'app',
  'src',
  'page',
  'layout',
  'route',
  'screen',
  'view',
  'controller',
  'model',
  'helper',
  'utils',
  'util',
  'types',
  'constants',
]);

function stripExtension(value) {
  return String(value).replace(/\.[^.]+$/, '');
}

function tokenize(value) {
  return String(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isGenericBaseName(value) {
  return GENERIC_BASE_NAMES.has(String(value).toLowerCase());
}

function isMostlyNumeric(value) {
  return /^[0-9._-]+$/.test(String(value));
}

export function describeChangedPath(filePath) {
  const segments = String(filePath)
    .split('/')
    .map((segment) => stripExtension(segment))
    .filter(Boolean);

  if (segments.length === 0) {
    return 'tracked-changes';
  }

  const baseName = segments.at(-1) || 'tracked-changes';
  if (!isGenericBaseName(baseName) && !isMostlyNumeric(baseName)) {
    return baseName;
  }

  const reversed = [...segments].reverse();
  const meaningfulSegments = [];
  for (const segment of reversed) {
    meaningfulSegments.unshift(segment);
    if (!isGenericBaseName(segment) && !isMostlyNumeric(segment)) {
      break;
    }
  }

  while (
    meaningfulSegments.length > 2 &&
    (isGenericBaseName(meaningfulSegments[0]) || isMostlyNumeric(meaningfulSegments[0]))
  ) {
    meaningfulSegments.shift();
  }

  return meaningfulSegments.join('-') || baseName;
}

export function buildChangeSlug(filePaths) {
  const descriptors = Array.from(new Set(filePaths.map(describeChangedPath)));
  const compactTokens = [];
  for (const descriptor of descriptors) {
    const descriptorTokens = tokenize(descriptor).filter(Boolean);
    if (descriptorTokens.length === 0) {
      continue;
    }

    let overlap = 0;
    const maxOverlap = Math.min(compactTokens.length, descriptorTokens.length);
    for (let size = maxOverlap; size > 0; size -= 1) {
      const compactSuffix = compactTokens.slice(-size).join(' ');
      const descriptorPrefix = descriptorTokens.slice(0, size).join(' ');
      if (compactSuffix === descriptorPrefix) {
        overlap = size;
        break;
      }
    }

    const tokensToAppend = descriptorTokens.slice(overlap);
    for (const token of tokensToAppend) {
      if (compactTokens.at(-1) === token) {
        continue;
      }
      compactTokens.push(token);
    }
  }

  const slug = compactTokens.slice(0, 6).join('-');
  return slug || 'tracked-changes';
}

export function buildChangeSummary(filePaths) {
  const slug = buildChangeSlug(filePaths);
  const phrase = slug.replace(/-/g, ' ');

  return {
    slug,
    branchName: `codex/auto/${slug}`,
    commitMessage: `chore: update ${phrase}`,
    prTitle: `chore: update ${phrase}`,
  };
}
