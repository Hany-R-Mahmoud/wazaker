export function evaluateOpenPullRequest(pr, repoOwner, options = {}) {
  const blocker = options.blocker ?? null;
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

  const headSha = String(pr?.head?.sha ?? '').trim();
  if (
    blocker &&
    blocker.manualActionRequired === true &&
    blocker.prNumber === pr?.number &&
    blocker.branch === branch &&
    blocker.headSha &&
    blocker.headSha === headSha
  ) {
    return {
      eligible: false,
      reason: 'manual-action-required',
      branch,
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      blockedAt: blocker.blockedAt ?? '',
      stopReason: blocker.stopReason ?? '',
    };
  }

  return {
    eligible: true,
    reason: 'eligible',
    branch,
    headSha,
    number: pr.number,
    title: pr.title,
    url: pr.html_url,
  };
}
