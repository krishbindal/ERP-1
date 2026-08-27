# Phase 5 — Communication: Schema & API Definition

## 1. Canonical Identity Model
All communication principals (senders and recipients) must map to the established SchoolOS Identity architecture.
- **Identity Path**: `auth.users` → `public.profiles`.
- **References**: `sender_id` and `recipient_id` in the Communication schema strictly reference `public.profiles(id)`, NOT `auth.users(id)` directly. The domain layer operates exclusively on `profiles`.

## 2. Domain Model

**1. `communication_messages`** (Aggregate Root)
- `id` (UUID, PK)
- `organization_id` (UUID, FK)
- `branch_id` (UUID, FK)
- `sender_id` (UUID, FK to profiles)
- `subject` (TEXT)
- `body` (TEXT)
- `status` (ENUM: DRAFT, SCHEDULED, QUEUED, PROCESSING, SENT, DELIVERED, PARTIALLY_FAILED, FAILED)
- `type` (ENUM: ANNOUNCEMENT, SYSTEM_NOTIFICATION)
- `scheduled_for` (TIMESTAMPTZ, nullable)
- `expires_at` (TIMESTAMPTZ, nullable)
- `created_at`, `updated_at`

**2. `communication_message_targets`**
Defines the high-level targeting requested by the sender.
- `message_id` (UUID, FK)
- `target_type` (ENUM: BRANCH, CLASS, SECTION)
- `target_id` (UUID, nullable, e.g., section_id)

**3. `communication_recipients`** (Per-Recipient Delivery State)
Maintains authoritative status of the recipient's personal delivery.
- `id` (UUID, PK)
- `message_id` (UUID, FK)
- `recipient_id` (UUID, FK to profiles)
- `status` (ENUM: QUEUED, SENT, DELIVERED, FAILED, READ)
- `read_at` (TIMESTAMPTZ, nullable)

**4. `communication_delivery_attempts`** (Attempt Evidence)
Preserves historical retry/fallback evidence without overwriting previous attempt failures.
- `id` (UUID, PK)
- `recipient_id` (UUID, FK to communication_recipients)
- `channel` (ENUM: IN_APP, PUSH, EMAIL)
- `provider` (TEXT, e.g., FCM, RESEND)
- `attempt_number` (INT)
- `provider_message_id` (TEXT, nullable)
- `error_details` (JSONB, nullable)
- `attempt_timestamp` (TIMESTAMPTZ)
- `success_delivery_timestamp` (TIMESTAMPTZ, nullable)

**5. `communication_attachments`**
- `id` (UUID, PK)
- `message_id` (UUID, FK)
- `file_path` (TEXT)
- `file_size` (INT)
- `content_type` (TEXT)

**6. `communication_templates`**
- `id` (UUID, PK)
- `branch_id` (UUID, FK)
- `title` (TEXT)
- `body_template` (TEXT)
- `variables_schema` (JSONB)
- `is_active` (BOOLEAN)

**7. `platform_events` (The Universal Outbox)**
Strengthened universal event schema supporting all domains without accidental branch-only limitations.
- `id` (UUID, PK)
- `organization_id` (UUID, NOT NULL)
- `branch_id` (UUID, NULLABLE) 
- `aggregate_type` (TEXT) -- e.g., 'communication_message'
- `aggregate_id` (UUID) -- e.g., message_id
- `event_type` (TEXT) -- e.g., 'message.queued'
- `payload` (JSONB)
- `actor_id` (UUID, NULLABLE, FK to profiles)
- `idempotency_key` (TEXT, UNIQUE NOT NULL)
- `status` (ENUM: PENDING, PROCESSING, COMPLETED, FAILED, DLQ)
- `attempts` (INT)
- `max_attempts` (INT)
- `next_retry_at` (TIMESTAMPTZ)
- `error_details` (JSONB)
- `created_at`, `processed_at`

**8. `communication_audit_logs`**
- `id` (UUID)
- `message_id` (UUID)
- `actor_id` (UUID, FK to profiles)
- `action` (TEXT)
- `metadata` (JSONB)
- `created_at` (TIMESTAMPTZ)

## 3. Exact Lifecycle

**Message Aggregate Lifecycle**:
The deterministic states and legal transitions for the message entity (`communication_messages`):
1. **DRAFT**: Created, targets editable.
2. **SCHEDULED**: Locked, queued for future dispatch.
3. **QUEUED**: Target dispatch time reached, platform event inserted.
4. **PROCESSING**: Worker is currently resolving recipients and fanning out delivery.
5. **SENT**: All provider dispatches attempted.
Terminal Aggregate States (aggregated asynchronously based on recipient resolutions):
- **DELIVERED**: 100% of recipient attempts confirmed successful.
- **PARTIALLY_FAILED**: Mixed delivery outcomes.
- **FAILED**: 100% provider rejections or DLQ.

**Recipient-Level Delivery State**:
Authoritative individual delivery status (`communication_recipients`):
1. **QUEUED**: Resolved, awaiting provider dispatch.
2. **SENT**: Provider accepted the request (e.g., HTTP 202).
3. **DELIVERED**: Provider confirmed delivery (e.g., webhook confirmation).
4. **FAILED**: Terminal failure (provider rejected, or max retries exceeded).
5. **READ**: User action confirmed visibility.

## 4. Recipient Snapshot Semantics
- **Resolution Policy**: Target audiences are deterministically resolved **at dispatch** (transition from `QUEUED` → `PROCESSING`). This ensures scheduled messages route to the current, correct `enrollments` at the time of sending, rather than generating stale snapshots at creation time.
- **Client Constraint**: The client never downloads arbitrary directories. It passes `{ target_type: 'SECTION', target_id: 'uuid' }`. 

## 5. Authorization / Teacher Scoping
- **Teacher Authorization**: A Teacher targeting a `SECTION` is authorized **strictly** if an active mapping exists between the Teacher's `profile_id` and the requested `section_id` in the `teacher_subject_assignments` table for the current academic year. Vague overlapping scopes are eliminated.
- **Cross-Branch / Unauthorized Data**: Strict `organization_id` and `branch_id` RLS isolation prevents inter-branch leakage and enumeration.
- **Guardians/Students**: Strictly read-only to messages where their `profile_id` exists in `communication_recipients`.

## 6. Idempotency & Retries
Replaced vague "exactly-once delivery" concepts with precise operational semantics:
- **Exactly-once Enqueueing**: The database guarantees exactly-once idempotent event creation. `platform_events` uses a strictly unique `idempotency_key` with a Postgres `UNIQUE` constraint, allowing atomic `ON CONFLICT DO NOTHING`.
- **At-least-once Processing**: The worker drains the outbox with at-least-once semantics. If a worker crashes after success but before DB commit, it will retry.
- **Provider Idempotency**: Where supported by the provider (e.g., Resend, FCM), the worker supplies the same `idempotency_key` via HTTP headers. The provider detects the duplicate and prevents a double-send, returning the cached successful response.

## 7. Delivery Architecture & Channels
- **Channels**: In-App, Push (FCM/APNs), Email. SMS explicitly omitted (V2).
- **Flow**: `Business TX (message status = QUEUED)` → `INSERT platform_events` → `Worker SELECT SKIP LOCKED` → `Resolves Recipients (at dispatch)` → `Insert communication_recipients` → `Provider attempt (records to communication_delivery_attempts)` → `Update platform_events`.

## 8. Retention
Data lifecycles are explicitly decoupled to balance privacy and compliance:
- **Ephemeral Notification Body**: Default 90-day retention auto-purge.
- **Official Announcement Body**: Follows organizational configuration (e.g., 2 years). No forced permanent retention.
- **Delivery-Attempt Retention**: Separate from payload retention. Retained for 1 year to diagnose routing failures.
- **Audit Retention**: Maintained for 7 years for compliance.
- **Purge Action**: When a message body purges, `communication_messages.body` and `subject` are destroyed. De-identified delivery facts remain intact in audit and recipient tables. Replay post-purge is structurally blocked.

## 9. Attachment Cleanup
Attachments reuse the hardened Homework Storage pattern with an explicit lifecycle:
1. **DB Purge**: Scheduled DB job hard-deletes (or nullifies) the DB reference when retention expires.
2. **Storage Cleanup Job**: An asynchronous worker listens for the DB purge event and executes physical deletion in the Supabase Storage bucket.
3. **Retry**: If the API call to Storage fails, it enters a DLQ for retry.
4. **Orphan Reconciliation**: A weekly operational cron compares DB records against Bucket objects, force-deleting any orphaned files (resolving edge-case DB/Storage desyncs).

## 10. Templates
- **Design**: `communication_templates` scoped to `branch_id`.
- **Variables**: Strict Handlebars/regex substitution using `variables_schema`. Arbitrary relational DB queries inside templates are strictly prohibited to prevent data exfiltration.

## 11. Rate Limiting / Abuse
- **Configurable Platform Limits**: Defined natively in branch configuration (e.g., `max_teacher_announcements_per_day = 5`, `max_admin_announcements_per_day = 20`).
- **Enforcement**: API Gateway or Database Trigger intercepts limit violations and logs to `communication_audit_logs` as `RATE_LIMITED`.

## 12. API / RPC Contracts
State transitions are locked behind strictly defined `SECURITY DEFINER` RPCs:
- `rpc_create_message(...)`
- `rpc_schedule_message(...)`
- `rpc_send_message(...)`
- `rpc_mark_read(...)`
- `rpc_resolve_recipients(...)` (Dry-run expansion count for UI)

## 13. Concurrency
- **Duplicate Publish Prevention**: Enforced via deterministic state progression (`UPDATE ... WHERE id = X AND status = 'DRAFT'`).
- **Worker Concurrency**: Postgres `SKIP LOCKED` absolutely isolates outbox processing.

## 14. Master Consistency Audit

This updated schema definition has been re-audited against the Master SchoolOS Architecture:

- **Identity**: Fully aligned. Replaced `auth.uid()` with the canonical `public.profiles` reference map.
- **RBAC & RLS**: Fully aligned. Preserves `branch_memberships` and `teacher_subject_assignments` natively.
- **Notification Architecture**: Fully aligned. Universal `platform_events` replaces bespoke logic and safely scales.
- **Data Architecture**: Fully aligned. Separates Aggregate vs Recipient state, and Message Retention vs Audit Retention explicitly.
- **Storage**: Fully aligned. Adopts the exact hardened Homework bucket RLS and defines the strict physical cleanup loop.
- **Attendance & Homework**: Fully aligned. The `platform_events` abstraction robustly accommodates their existing payloads seamlessly.
- **Branch App Factory**: Compatible. Defers push token routing to Expo/FCM edge functions seamlessly mapped via `branch_id`.
- **Cross-Cutting Master Roadmap**: Verified and documented separately; no cross-cutting capabilities were miscategorized as domain-specific.