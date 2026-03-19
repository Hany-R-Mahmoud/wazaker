#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot, writeContext, writeReport } from './lib/automation-platform.mjs';

const benchmarkRoot = process.env.AUTOMATION_BENCHMARK_ROOT || repoRoot;
const runsDir = join(benchmarkRoot, 'benchmarks', 'asr', 'runs');
const providerDirs = existsSync(runsDir)
  ? readdirSync(runsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
  : [];

const results = providerDirs
  .map((provider) => {
    const resultPath = join(runsDir, provider, 'results.json');
    if (!existsSync(resultPath)) {
      return null;
    }
    return JSON.parse(readFileSync(resultPath, 'utf8'));
  })
  .filter(Boolean);

if (results.length === 0) {
  process.stderr.write('No ASR benchmark results found.\n');
  process.exit(1);
}

const rankedProviders = [...results].sort(
  (left, right) => left.averageWordErrorRate - right.averageWordErrorRate,
);
const bestProvider = rankedProviders[0];
const worstProvider = rankedProviders[rankedProviders.length - 1];
const sampleFindings = rankedProviders.flatMap((provider) =>
  provider.samples.map((sample) => ({
    provider: provider.provider,
    sampleId: sample.sampleId,
    passageLabel: sample.passageLabel,
    wordErrorRate: sample.wordErrorRate,
  })),
);

const worstSamples = [...sampleFindings]
  .sort((left, right) => right.wordErrorRate - left.wordErrorRate)
  .slice(0, 5);

const report = {
  generatedAt: new Date().toISOString(),
  providerCount: results.length,
  bestProvider: {
    name: bestProvider.provider,
    averageWordErrorRate: bestProvider.averageWordErrorRate,
  },
  worstProvider: {
    name: worstProvider.provider,
    averageWordErrorRate: worstProvider.averageWordErrorRate,
  },
  rankedProviders: rankedProviders.map((provider) => ({
    provider: provider.provider,
    sampleCount: provider.sampleCount,
    averageWordErrorRate: provider.averageWordErrorRate,
  })),
  worstSamples,
};

const reportRelativePath = `speech-qa/${report.generatedAt.replace(/[:]/g, '-')}.md`;
const lines = [
  '# Speech QA Report',
  '',
  `Generated: ${report.generatedAt}`,
  '',
  '## Provider Ranking',
  '',
  ...report.rankedProviders.map(
    (provider, index) =>
      `${index + 1}. ${provider.provider} -> avg WER ${provider.averageWordErrorRate.toFixed(4)} across ${provider.sampleCount} samples`,
  ),
  '',
  '## Worst Samples',
  '',
  ...report.worstSamples.map(
    (sample) =>
      `- ${sample.provider} / ${sample.passageLabel} (${sample.sampleId}) -> WER ${sample.wordErrorRate.toFixed(4)}`,
  ),
];

writeReport(reportRelativePath, lines.join('\n'));
writeContext('speech-qa', report);

process.stdout.write(
  JSON.stringify(
    {
      ...report,
      reportRelativePath,
      contextKey: 'speech-qa',
    },
    null,
    2,
  ),
);
