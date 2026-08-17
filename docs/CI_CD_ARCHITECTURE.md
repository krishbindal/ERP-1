# CI/CD Architecture

## 1. Overview
SchoolOS enforces a strict CI/CD governance model powered by a persistent, self-hosted Windows GitHub Actions Runner.

## 2. Infrastructure
- **Provider**: GitHub Actions
- **Runner**: Windows x64 (Self-Hosted)
- **Labels**: `self-hosted`, `windows`, `schoolos-ci`
- **Scope**: `krishbindal/ERP-1`

## 3. Workflows
- **Runner Smoke Test** (`.github/workflows/runner-smoke-test.yml`): Validates the system environment.
- **CI** (`.github/workflows/ci.yml`): Runs on PR and Push to `master`. Enforces all validation steps.

## 4. Required Checks
The following checks must pass before a PR can be merged into `master`:
- `Validation and Tests`

## 5. Security Gates
- Node dependencies are checked with `npm audit`.
- Supabase RLS policies are strictly tested via `pgTAP`.
- Workflows use least-privilege `GITHUB_TOKEN` permissions.
