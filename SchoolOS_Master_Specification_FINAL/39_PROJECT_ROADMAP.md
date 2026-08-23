# SchoolOS — Project Roadmap

## Phase 0 — Discovery (COMPLETED)
- client requirements
- competitor research
- actors
- journeys
- non-functional requirements

## Phase 1 — Architecture (COMPLETED)
- system architecture
- technology choices
- environments
- app strategy
- data strategy

## Phase 2 — Tenancy/security foundation (COMPLETED)
- organization
- branches
- memberships
- auth
- roles
- permissions
- RLS
- audit
- branch configuration
- Super Admin

## Phase 3 — Academic foundation (COMPLETED)
- people
- years
- classes
- sections
- subjects
- enrollment

## Phase 4 — Scheduling (COMPLETED)
- bell schedules
- periods
- rooms
- instructional days
- calendar
- timetable

## Phase 5 — Operations
- attendance
- homework
- communication

## Cross-cutting Platform Capabilities — Planned / Must Not Be Forgotten
These capabilities span multiple modules and remain part of the SchoolOS master product scope. They are tracked independently of the module implementation sequence and must be reconciled into the relevant module specifications before production certification.

### Smart Import & Template Engine
- downloadable module-aware CSV/XLSX templates
- required/optional/system-managed field classification
- column mapping and validation
- row-level validation errors
- duplicate detection
- preview before commit
- admin approval before import
- transactional/batched processing
- restartable/idempotent large imports
- reconciliation reports
- authorization and import audit trail
- dynamic templates generated from the relevant module schema/configuration

### Missing-Field & System-Field Generation
- automatically generate system-owned fields such as UUIDs, timestamps, trusted organization/branch context, and actor fields
- automatically generate allowed business identifiers when the school has no existing value, using a configured generator/template
- never fabricate meaningful business data
- generated values must be visible during import preview before approval
- generation must guarantee database-level uniqueness

### Configurable Identifier Templates
Support school/branch-configurable templates for identifiers such as:
- student admission number
- student code
- employee/staff ID
- invoice/reference numbers where applicable
- other approved entity identifiers

Generators may use approved context such as organization, branch, academic year, prefix, and sequence. The system remains authoritative for uniqueness and numbering. Concurrent generation must be deterministic and collision-safe; failed transactions must not create duplicate identifiers.

### Temporary First-Login Credentials
For users who may not have an email address or phone number, especially students:
- provision an initial temporary credential through the canonical authentication system
- never store temporary passwords in plaintext
- require password change on first successful login
- invalidate the temporary credential after the permanent password is established
- support secure admin/authorized-staff provisioning and reset flows
- support future bulk provisioning while preserving the same security boundary
- define a secure recovery/reset path for users without email or phone access

### School Work-Efficiency Layer
SchoolOS must continuously reduce unnecessary typing, clicking, repetition, coordination, remembering, and manual verification. Each major workflow should apply the following principles where safe:
- derive information the system already knows instead of asking the user to re-enter it
- enter data once and reuse it across dependent modules
- configure once and automate repeated work
- generate legitimate system identifiers and other safe system-managed values automatically
- batch repetitive operations with preview, approval, progress, reconciliation, and audit
- surface exceptions instead of forcing staff to inspect normal records one by one
- turn actionable problems into one-click or guided fixes where deterministic safety permits
- use progressive disclosure and guided workflows instead of oversized forms
- provide contextual actions from the record currently being viewed
- explain authorization, validation, and workflow blockers in user-friendly language

### Action Center / Exception Engine
Provide role-specific operational attention queues rather than dashboard-only metrics. Examples include:
- attendance pending or missing
- incomplete student onboarding
- missing documents or identifiers
- overdue/failed financial operations
- homework awaiting grading
- failed notifications
- unresolved duplicates or validation exceptions
- compliance/reporting items requiring action

Normal records should remain quiet; exceptions should be prioritized.

### Universal Search & Contextual Navigation
Planned platform capability for authorized cross-module search and contextual navigation:
- search students, guardians, staff, sections, identifiers, invoices, documents, assignments, and other approved entities
- return only authorized results
- open the relevant record without forcing repeated module navigation
- preserve branch/organization scope and sensitive-data restrictions

### Duplicate Detection & Record Resolution
Before creating or importing potentially duplicate people/entities:
- detect likely matches using approved identity/business fields
- show a reviewable match explanation
- support link/merge/retain-distinct workflows only where explicitly authorized
- never silently merge records
- preserve audit/history of any approved resolution

### Onboarding Checklists
Track completion state for major lifecycle workflows:
- student onboarding
- staff/teacher onboarding
- guardian linking
- branch setup
- app provisioning
- other configured onboarding journeys

Show missing requirements and safe next actions rather than requiring manual checklist tracking outside SchoolOS.

### Bulk Operation Engine
General reusable infrastructure for safe bulk operations beyond import:
- validation
- preview
- missing-field generation
- duplicate detection
- authorization
- approval
- processing/progress
- batching
- retry/restart
- reconciliation
- audit

Potential consumers include student admission/promotion, teacher assignments, guardian linking, fee assignments, marks, exports, notifications, and other approved large operations.

### Compliance & Reporting Automation
Long-term capability to reduce regulatory/reporting burden:
- map authoritative SchoolOS records into external reporting templates/APIs where officially supported
- validate missing/invalid required data before submission
- generate compliant exports
- retain submission/reconciliation evidence
- distinguish internal identifiers from external official identifiers
- never fabricate official/regulatory data

### Contextual Communication & Notification Intelligence
Communication should be available from the context where the need arises, while preserving recipient authorization:
- contact the authorized guardian from a student/attendance/fee/homework context
- automatically derive the eligible recipient set where safe
- prepare reusable templates
- support channel-aware notification rules
- avoid duplicate/noisy delivery
- maintain delivery status, retry, audit, and recipient-scope integrity

### School-Day Automation
Long-term automation layer for recurring operational routines:
- scheduled reminders
- attendance exception processing
- homework/assessment reminders
- fee follow-up workflows
- daily/weekly summaries
- recurring compliance checks
- other approved branch-configured jobs

Automations must be deterministic, auditable, idempotent, permission-aware, and independently failure-isolated from core transactions.

### Safe AI Assistance
AI is an assistant, not an authority over protected academic/financial/security data. Approved future patterns include:
- draft/recommend rather than silently commit
- human approval before consequential publication or mutation
- AI-assisted search, summarization, translation, message drafting, lesson planning, grading assistance, analytics, and anomaly detection where approved
- deterministic system rules remain authoritative for identifiers, permissions, financial state, enrollment, attendance state, and other protected invariants
- AI actions must be auditable and privacy-scoped

### Multilingual / Localization Automation
Reduce repeated translation work for schools and families:
- localized UI where supported
- reusable multilingual communication templates
- channel-aware localization
- preserve the authoritative meaning of school-approved messages
- never auto-translate sensitive official/legal content without appropriate review requirements

### Privacy & Data Center
Long-term administrative visibility into:
- what sensitive data is stored
- why it is stored
- who can access it
- retention category
- guardian/child relationships
- consent/notice state where applicable
- access/export/privacy requests
- relevant audit history

### Branch App Factory & Per-Branch Applications
Every branch must have its own branded production application instance/configuration while using the shared SchoolOS codebase.
- unique Android package/application identity per branch
- unique iOS bundle identity per branch
- branch-specific name, logo, icon, splash, theme, enabled modules, support metadata, and notification identity
- branch-specific deep links and provider configuration where applicable
- centralized build/release automation from shared code/configuration
- separate signing/provider secrets stored in secure CI/CD systems
- branch app runtime must never rely on a client-side branch selector as a security boundary
- branch authorization remains enforced server-side/RLS
- branch app provisioning, QA, push/deep-link testing, and store metadata are part of the App Factory lifecycle

### Feature-Scope Rule
The above capabilities are permanent SchoolOS requirements/backlog items even when not yet implemented. They must be classified in each affected module as IMPLEMENTED, SPECIFIED, PLANNED, DEFERRED, or UNRESOLVED and must not be silently dropped during module development.

## Phase 6 — Assessments
- exams
- marks
- grading
- results
- report cards

## Phase 7 — Finance
- fee structures
- invoices
- payments
- receipts
- discounts
- refunds
- reports

## Phase 8 — Supporting modules
- admissions
- transport
- library
- inventory
- HR/payroll if required

## Phase 9 — Analytics
- branch dashboards
- organization dashboards
- reports
- exports

## Phase 10 — Apps
- branch app factory
- Android builds
- iOS builds
- notification identities
- store operations

## Phase 11 — Production certification
- security
- RLS
- E2E
- performance
- backup/restore
- monitoring
- handover
