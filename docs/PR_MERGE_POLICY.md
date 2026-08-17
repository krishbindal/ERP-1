# PR & Merge Policy

## 1. Feature Development
- **No direct commits** to `master` are permitted.
- All development must occur on dedicated feature branches (e.g., `phase-3b-academics`).

## 2. Pull Requests
- A Pull Request must be opened against `master`.
- The CI workflow must execute and report a `PASS` status.
- At least one approving review from a CODEOWNER is required.
- The branch must be up to date with `master`.
- The CI runs `npm audit` and validates against known non-reachable framework exceptions. Any unhandled HIGH or CRITICAL vulnerability will block the PR.

## 3. Merging
- Once CI is green and approvals are met, the PR can be merged.
- Fast-forward or Squash merges are preferred depending on commit history cleanliness.

## 4. Post-Merge Validation
- After merging to `master`, the CI workflow will execute again against the merged `master` commit.
- This includes a fresh database reset, running all historical tests, and executing the build.
- The new phase is only considered `CERTIFIED` once the post-merge regression passes.
