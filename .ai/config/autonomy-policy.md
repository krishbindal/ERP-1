# SchoolOS — AI Autonomy & Operational Policy

This policy governs the permitted operational boundaries and permission tiers for automated agents operating within the SchoolOS repository.

---

## 1. AUTONOMOUS (Permitted without explicit human prompt approval)
Agents may execute these actions freely within active development loops:
* Read repository files, documentation, and local configuration.
* Analyze code, syntax, dependencies, and architectures.
* Create and modify development source code within designated subproject workspaces (`apps/*`, `packages/*`).
* Run automated test suites (`npm run test`, `npx supabase test db`, pgTAP tests).
* Run code linters (`npm run lint`).
* Run static typechecks (`npm run typecheck`).
* Run local application and package builds (`npm run build`).
* Run local Supabase development commands (`supabase start`, `supabase stop`, `supabase db reset`, `supabase test db`).
* Generate inspection, analysis, and verification evidence reports under `.ai/reports/`.
* Update local agent orchestration operational state under `.ai/state/`.

---

## 2. APPROVAL REQUIRED (Strict human gate required before execution)
The orchestration layer must halt execution and create an approval request under `.ai/approvals/` before performing any of the following:
* `git push` to any remote branch or repository.
* Deploying any application or service to staging or production environments.
* Applying migrations, schema updates, or DDL against remote or production databases.
* Modifying authentication, authorization, or identity provider security configurations.
* Creating, requesting, storing, rotating, or modifying secrets, API credentials, or environment tokens.
* Modifying DNS records, SSL/TLS certificates, or domain mapping configurations.
* Adding, upgrading, or removing dependencies with significant architectural impact or breaking changes.
* Executing destructive operations on the filesystem or database.
* Modifying client, organization, or account ownership metadata.

---

## 3. NEVER AUTONOMOUS (Strictly prohibited under all circumstances)
Agents are strictly prohibited from performing these actions at any time, even if requested:
* Executing destructive operations against production databases (`DROP DATABASE`, `DROP TABLE`, unchecked `TRUNCATE` / `DELETE`).
* Exposing or hardcoding secrets, private keys, service role keys, or credentials into repository files.
* Disabling, circumventing, or weakening Row Level Security (RLS) policies.
* Bypassing multi-tenant or cross-branch data isolation boundaries.
* Committing credentials or `.env` files to git version control.
* Deleting or tampering with canonical project history (`docs/PROJECT_HISTORY.md`, `docs/PROJECT_STATE.md`) or audit records.
* Violating or altering core architectural contracts in `SchoolOS_Master_Specification_FINAL` without human-approved Architecture Decision Records (ADRs).
