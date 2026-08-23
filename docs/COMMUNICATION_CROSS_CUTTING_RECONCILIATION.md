# Cross-Cutting Feature Reconciliation

This document explicitly classifies cross-cutting features discussed throughout the SchoolOS lifecycle, verifying their status against the Phase 5 Communication design and overall roadmap. 

None of these capabilities are silently lost. They are explicitly triaged below.

## 1. Mapped to Existing Implementation
*   **Audit/History**: Mapped via `communication_audit_logs` (Phase 5) and global trigger-based auditing (Phase 2).
*   **Roles & Permissions (RBAC/RLS)**: Core architecture established in Phases 1 & 2.
*   **Contextual Recipient Selection**: Solved in Phase 5 Communication via DB-side resolution RPCs.

## 2. Handled within Phase 5 (Communication)
*   **Notifications (Email/Push)**: Handled via `platform_events` generic outbox.
*   **Configurable Identifier Templates**: Handled via `communication_templates` with Handlebars/Regex variables.
*   **Actionable Delivery Exceptions**: Handled via `platform_events` DLQ and `communication_recipients.delivery_status`.
*   **Smart Defaults / Minimal Typing**: Core V1 Communication UX requirement.

## 3. Placed into Future System Core / Platform Features
*   **Universal Search**: Requires dedicated search indexing (e.g., Postgres Full Text Search or Elastic). Not part of Communication.
*   **Automation (pg_cron)**: Being established as part of `platform_events` outbox relay, but general workflow automation is a broader system feature.
*   **Duplicate Detection**: Handled natively in messaging via `idempotency_key`, but global record duplicate detection (e.g., student records) belongs in Admissions/Onboarding.
*   **Exception Engine**: Extends the DLQ concept from Phase 5 into a global dashboard for Super Admins.

## 4. Explicitly Deferred to Dedicated Modules
*   **Smart Import & Bulk Import/Export**: Deferred to an explicit **Data Migration & Onboarding Phase** (Pre-Launch).
*   **Temporary First-Login Credentials & Pass Generation**: Deferred to **Admissions / Security** operations.
*   **Missing/System Field Generation & Progressive Profiling**: Deferred to **Student/Guardian Portal UX** updates.
*   **Onboarding Automation & Compliance Automation**: Deferred to **Admissions / HR**.
*   **Reporting & Analytics**: Deferred to **Phase 15 (Reporting/Analytics)**.
*   **AI Assistance**: Deferred to a future "Intelligence" overlay post-V1 stable release.
