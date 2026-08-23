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

Generators may use approved context such as organization, branch, academic year, prefix, and sequence. The system remains authoritative for uniqueness and numbering.

### Temporary First-Login Credentials
For users who may not have an email address or phone number, especially students:
- provision an initial temporary credential through the canonical authentication system
- never store temporary passwords in plaintext
- require password change on first successful login
- invalidate the temporary credential after the permanent password is established
- support secure admin/authorized-staff provisioning and reset flows
- support future bulk provisioning while preserving the same security boundary

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
