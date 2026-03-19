export function evaluateOpenPullRequest(pr, repoOwner) {
  if (pr?.draft) {
    return { eligible: false, reason: 'draft' };
  }

  const headOwner = pr?.head?.repo?.owner?.login ?? null;
  if (!headOwner || !repoOwner || headOwner !== repoOwner) {
    return { eligible: false, reason: 'fork-or-unknown-owner' };
  }

  const branch = String(pr?.head?.ref ?? '').trim();
  if (!branch || branch === 'main') {
    return { eligible: false, reason: 'invalid-head-branch' };
  }

  return {
    eligible: true,
    reason: 'eligible',
    branch,
    number: pr.number,
    title: pr.title,
    url: pr.html_url,
  };
}
