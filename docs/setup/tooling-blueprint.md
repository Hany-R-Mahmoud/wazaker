# Tooling Blueprint

## Canonical Tools

### Code And Documentation

- GitHub repository: `wazaker`
- repo is the source of truth for product, architecture, and research docs

### Project Management

- Plane
- use Plane for epics, stories, milestones, and execution status
- workspace: https://app.plane.so/wazaker/
- project: https://app.plane.so/wazaker/projects/3bddb944-c6c3-4fe1-aaec-a6b1be247789/issues

### Design

- Stitch for ideation and screen exploration
- Stitch project: https://stitch.withgoogle.com/u/2/projects/2691052854315164041?pli=1
- Penpot for approved designs, flows, and reusable design assets
- Penpot project: https://design.penpot.app/#/dashboard/files?team-id=ddc4a96c-d2ad-80ac-8007-b96e3466a50b&project-id=5b4e6c3a-cdc2-8047-8007-b974e538e199

## Artifact Map

- user stories: `docs/product/user-stories.md` and mirrored into Plane
- Plane backlog source: `docs/product/plane-backlog.json`
- Plane import export: `docs/product/plane-backlog.csv`
- MVP scope: `docs/product/mvp-scope.md`
- architecture decisions: `docs/architecture/adrs/`
- research: `docs/research/`
- design links: `design/links.md`

## Automation Targets

- local repo scaffolding
- docs and backlog seeds
- Plane backlog export generation
- setup checklists
- integration placeholders through `.env.example`

## Expected Manual Approval Points

- GitHub login or token fix
- Plane workspace creation or authorization
- Penpot workspace creation or authorization
- Stitch project access
