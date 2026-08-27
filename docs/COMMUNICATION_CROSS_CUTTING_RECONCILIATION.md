# Cross-Cutting Feature Reconciliation

This document explicitly classifies cross-cutting features discussed throughout the SchoolOS lifecycle, verifying their status against the Phase 5 Communication design and overall master roadmap.

These are permanent cross-cutting SchoolOS capabilities. They do NOT belong exclusively to Admissions or Student UX, and their master classification is explicitly preserved.

## 1. Mapped to Existing Implementation
*   **Audit/History**: IMPLEMENTED (Global trigger-based auditing, Phase 2) + `communication_audit_logs` (Phase 5).
*   **Roles & Permissions (RBAC/RLS)**: IMPLEMENTED (Core architecture established in Phases 1 & 2).
*   **Contextual Recipient Selection**: IMPLEMENTED (Solved in Phase 5 Communication via DB-side resolution RPCs).

## 2. Handled within Phase 5 (Communication)
*   **Notifications (Email/Push)**: SPECIFIED (Handled via `platform_events` generic outbox).
*   **Configurable Identifier Templates**: SPECIFIED (Handled via `communication_templates` with Handlebars/Regex variables).
*   **Actionable Delivery Exceptions**: SPECIFIED (Handled via `platform_events` DLQ and `communication_delivery_attempts`).
*   **Smart Defaults / Minimal Typing**: SPECIFIED (Core V1 Communication UX requirement).

## 3. Placed into Future System Core / Platform Features
*   **Universal Search**: PLANNED (Requires dedicated search indexing layer).
*   **Automation (pg_cron)**: PLANNED (Established as part of outbox relay; extends to broader system workflows).
*   **Duplicate Detection**: PLANNED (Native in messaging via `idempotency_key`, but global record detection remains planned).
*   **Exception Engine**: PLANNED (Extends the DLQ concept from Phase 5 into a global dashboard for Super Admins).
*   **Reporting & Analytics**: PLANNED (Phase 15).

## 4. Explicitly Maintained Cross-Cutting Classifications
These features are permanently tracked on the master roadmap and explicitly deferred for subsequent dedicated operational modules.

*   **Temporary First-Login Credentials & Pass Generation**: DEFERRED
*   **Missing/System Field Generation & Progressive Profiling**: DEFERRED
*   **Smart Import / Bulk Import/Export**: DEFERRED
*   **Onboarding Automation**: DEFERRED
*   **Compliance Automation**: DEFERRED
*   **AI Assistance**: DEFERRED (Future "Intelligence" overlay post-V1 stable release).
