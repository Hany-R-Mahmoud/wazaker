const http = require('node:http');

const post = (path, body, headers = {}) =>
  new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port: 5678,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          resolve({ path, status: res.statusCode, body: data });
        });
      },
    );

    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });

async function main() {
  const results = [];

  results.push(
    await post('/webhook/CommitSummaryPlane01/pushwebhook/github-push-summary', {
      ref: 'refs/heads/codex/test-webhook',
      compare: 'https://example.com/compare',
      commits: [{ id: 'abc1234', message: 'test commit from synthetic webhook' }],
    }),
  );

  results.push(
    await post('/webhook/GhIssueTriage01/issuewebhook/github-issue-triage', {
      issue: {
        number: 9991,
        title: 'Synthetic issue for webhook validation',
        body: 'UI screen has a medium severity layout issue.',
        html_url: 'https://example.com/issues/9991',
        labels: [{ name: 'bug' }],
      },
    }),
  );

  results.push(
    await post('/webhook/PrReviewFirstPass01/prwebhook/github-pr-first-pass', {
      pull_request: {
        title: 'Synthetic PR validation payload',
        body: 'Testing the first-pass review automation.',
        changed_files: 3,
        additions: 42,
        deletions: 8,
      },
    }),
  );

  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exit(1);
});
