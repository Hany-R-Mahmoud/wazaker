#!/usr/bin/env node

import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  repoRoot,
  writeContext,
  writeReport,
} from './lib/automation-platform.mjs';

const IGNORE_DIRS = new Set([
  '.git',
  'node_modules',
  '.automation',
  'tmp',
  '.expo',
]);

function listDir(dirPath, depth = 0, maxDepth = 2) {
  if (depth > maxDepth) {
    return [];
  }

  return readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => !IGNORE_DIRS.has(entry.name))
    .map((entry) => {
      const absolutePath = join(dirPath, entry.name);
      const relPath = relative(repoRoot, absolutePath) || '.';
      if (entry.isDirectory()) {
        return {
          type: 'directory',
          path: relPath,
          children: listDir(absolutePath, depth + 1, maxDepth),
        };
      }

      return {
        type: 'file',
        path: relPath,
        size: statSync(absolutePath).size,
      };
    });
}

const topLevelEntries = readdirSync(repoRoot, { withFileTypes: true })
  .filter((entry) => !IGNORE_DIRS.has(entry.name))
  .sort((left, right) => left.name.localeCompare(right.name));

const map = {
  generatedAt: new Date().toISOString(),
  topLevelDirectories: topLevelEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name),
  topLevelFiles: topLevelEntries.filter((entry) => entry.isFile()).map((entry) => entry.name),
  tree: listDir(repoRoot),
};

const reportRelativePath = `codebase-maps/${map.generatedAt.replace(/[:]/g, '-')}.md`;
const reportLines = [
  '# Codebase Map',
  '',
  `Generated: ${map.generatedAt}`,
  '',
  '## Top Level Directories',
  '',
  ...map.topLevelDirectories.map((entry) => `- ${entry}`),
  '',
  '## Top Level Files',
  '',
  ...map.topLevelFiles.map((entry) => `- ${entry}`),
  '',
  '## Tree Snapshot',
  '',
  '```json',
  JSON.stringify(map.tree, null, 2),
  '```',
];

writeReport(reportRelativePath, reportLines.join('\n'));
writeContext('codebase-map', map);

process.stdout.write(
  JSON.stringify(
    {
      generatedAt: map.generatedAt,
      reportRelativePath,
      contextKey: 'codebase-map',
      topLevelDirectories: map.topLevelDirectories,
      topLevelFiles: map.topLevelFiles,
    },
    null,
    2,
  ),
);
