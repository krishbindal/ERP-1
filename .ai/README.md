# SchoolOS — AI Orchestration Layer

## 1. Purpose of the Orchestration Layer
The `.ai/` directory provides the scaffolding and state management for a controlled, semi-autonomous AI multi-agent orchestration layer. It structures the coordination between planning, executing, testing, and reviewing AI agents while enforcing architectural discipline, security guardrails, and human oversight.

## 2. Multi-Agent Relationship & Roles
* **Planner & Reviewer (OpenAI/Supervisory Agent)**: 
  * Analyzes master specifications and phase requirements to generate deterministic, scoped task plans.
  * Evaluates execution output, test evidence, and diffs to determine task outcome (`PASS`, `FIX`, or `BLOCKED`).
* **Executor (Antigravity Agent)**:
  * Implements code changes strictly within the bounds defined by the task plan.
  * Executes local verification commands (lint, typecheck, unit tests, pgTAP database tests, builds).
  * Collates verifiable execution evidence.

## 3. Relationship to Documentation & Project State
* **Not the Source of Truth**: The `.ai/` directory and its state files are **operational execution artifacts only**. The authoritative source of truth for all requirements, architecture, data contracts, and security rules remains:
  * `SchoolOS_Master_Specification_FINAL/` (Master specification baseline)
  * `docs/` (Active architecture decision logs, database contracts, and certified phase reports)
* **Project State Integration**:
  * `docs/PROJECT_STATE.md` tracks official certified project milestones, tech baseline, migrations, and phase progression.
  * `docs/PROJECT_HISTORY.md` records verified chronological phase completions.
  * `.ai/state/ORCHESTRATOR_STATE.md` reflects only transient agent operational status, active subtasks, and queue state.

## 4. Planned Future Workflow
The orchestration engine will operate through a deterministic feedback loop:

```text
[Planner Agent]
      │
      ▼ (Generates Task Definition)
[.ai/queue/pending]
      │
      ▼ (Picks up Task)
[Antigravity Executor] ───► Implements Code & Runs Validations (npm run validate / supabase test db)
      │
      ▼ (Generates Evidence Report)
[.ai/reports/ & .ai/queue/running]
      │
      ▼ (Submits for Review)
[Reviewer Agent] ───► Evaluates Evidence against Master Spec & Security Rules
      │
      ├──► PASS     ──► Moves to .ai/queue/completed
      ├──► FIX      ──► Appends instructions and re-queues to .ai/queue/pending
      └──► BLOCKED  ──► Requests human intervention via .ai/approvals/ and moves to .ai/queue/failed
```

## 5. Deployment & Production Safety Notice
* **Autonomous Production Deployment**: **DISABLED / NOT ENABLED**.
* All production database migrations, production hosting deployments, secret provisioning, domain/DNS changes, and git pushes to protected remote branches require explicit, out-of-band human review and approval.
* The orchestrator is currently in an unactivated scaffolding state.
