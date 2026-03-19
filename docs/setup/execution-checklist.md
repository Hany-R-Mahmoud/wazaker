# Execution Checklist

## Automated In This Phase

- repo scaffold
- product docs seed
- architecture docs seed
- research docs seed
- agent roster and team charter
- local git initialization
- automation operating model
- guarded delivery pipeline artifacts
- local `n8n + Ollama + automation-runner` workflows

## Requires User Auth Or Click Approval

- create GitHub repo under the user's account
- authorize GitHub CLI or provide a valid token
- create or confirm Plane workspace/project
- create or confirm Penpot workspace/project
- create or confirm Stitch project

## Next Automation Layer

After external auth is available:

1. create remote repository and connect local repo
2. create Plane workspace artifacts
3. register design links
4. derive backlog from product docs

## Phase 4 Entry

Once phases 1 through 3 are complete:

1. use `spec-kit` for feature clarification and planning
2. move implementation-ready tasks into the guarded delivery pipeline
3. let the PR automation flow handle review and merge
