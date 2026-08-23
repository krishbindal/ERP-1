# Phase 5 — Communication: Schema & API Definition

## 1. Domain Model

**1. `communication_messages`**
- `id` (UUID, PK)
- `branch_id` (UUID, FK)
- `sender_id` (UUID, FK to users)
- `subject` (TEXT)
- `body` (TEXT)
- `status` (ENUM: DRAFT, SCHEDULED, QUEUED, DELIVERED, FAILED)
- `type` (ENUM: ANNOUNCEMENT, SYSTEM_NOTIFICATION)
- `scheduled_for` (TIMESTAMPTZ, nullable)
- `expires_at` (TIMESTAMPTZ, nullable)
- `created_at`, `updated_at`

**2. `communication_message_targets`**
Defines the high-level targeting requested by the sender.
- `message_id` (UUID, FK)
- `target_type` (ENUM: BRANCH, CLASS, SECTION, GUARDIANS_OF_SECTION)
- `target_id` (UUID, nullable, e.g., section_id)

**3. `communication_recipients`**
The resolved individual recipients.
- `id` (UUID, PK)
- `message_id` (UUID, FK)
- `recipient_id` (UUID, FK to users)
- `delivery_status` (ENUM: PENDING, SENT, DELIVERED, READ, FAILED)
- `read_at` (TIMESTAMPTZ)
- `provider_message_id` (TEXT, e.g., FCM/Resend ID)

**4. `communication_attachments`**
- `id` (UUID, PK)
- `message_id` (UUID, FK)
- `file_path` (TEXT)
- `file_size` (INT)
- `content_type` (TEXT)

**5. `communication_templates`**
- `id` (UUID, PK)
- `branch_id` (UUID, FK)
- `title` (TEXT)
- `body_template` (TEXT)
- `variables_schema` (JSONB)
- `is_active` (BOOLEAN)

**6. `user_notification_preferences`**
- `user_id` (UUID, PK)
- `topic` (TEXT, PK)
- `in_app_enabled` (BOOLEAN, default true)
- `email_enabled` (BOOLEAN, default true)
- `push_enabled` (BOOLEAN, default true)

**7. `platform_events` (The Universal Outbox)**
- `id` (UUID, PK)
- `branch_id` (UUID, FK)
- `topic` (TEXT) -- e.g., 'communication.message.queued'
- `aggregate_id` (UUID) -- e.g., message_id
- `payload` (JSONB)
- `idempotency_key` (TEXT, UNIQUE)
- `status` (ENUM: PENDING, PROCESSING, COMPLETED, FAILED, DLQ)
- `attempts` (INT)
- `max_attempts` (INT)
- `next_retry_at` (TIMESTAMPTZ)
- `error_details` (JSONB)
- `created_at`, `processed_at`

**8. `communication_audit_logs`**
- `id` (UUID)
- `message_id` (UUID)
- `actor_id` (UUID)
- `action` (TEXT)
- `metadata` (JSONB)

## 2. Exact Lifecycle
- **DRAFT**: Message created, targets can be updated.
- **SCHEDULED**: Message locked, queued for future dispatch.
- **QUEUED**: Active dispatch; `platform_events` record inserted. Cannot be edited.
- **DELIVERED**: Terminal success state (100% of targets processed).
- **FAILED**: Terminal failure state (e.g., DLQ reached for dispatch).
- **Retention/Archive**: Reaching `expires_at` (90 days for ephemeral) triggers hard-deletion of `communication_messages` body, but `communication_audit_logs` and anonymized delivery metrics remain.

## 3. Recipient Resolution
Contextual recipient resolution occurs **server-side** during the outbox worker processing (or via a dedicated expansion RPC).
- The client passes targets: `[{ target_type: 'SECTION', target_id: 'uuid' }]`.
- **Branch-wide**: Admin `branch_id` expands to all active members in `branch_memberships`.
- **Class/Section-wide**: Expands via `enrollments` for students.
- **Guardian Audience**: Joins `student_guardians` on the resolved student list.
- **Teacher-authorized**: Resolution strictly joins against `teacher_subject_assignments` to verify the sender is authorized to target the specified section.
*The client NEVER downloads branch-wide directories to construct a payload.*

## 4. Authorization / RLS
- **Super Admin**: Global visibility.
- **Branch Admin**: Full CRUD on messages within their `branch_id`.
- **Teacher**: Can create/send messages. RLS restricts `target_id` to sections explicitly present in their active `teacher_subject_assignments`.
- **Student / Guardian**: Strictly `SELECT` only on `communication_recipients` where `recipient_id = auth.uid()`. One-Way boundary enforced natively.

**Explicit Test Denials**:
- Cross-branch denial: User from Branch A attempts to read/send in Branch B.
- Unauthorized teacher scope: Teacher sends to Section X they do not teach.
- Recipient enumeration: Client invoking resolution RPC for an unauthorized section returns `403/[]`.

## 5. Platform Outbox (Generic)
- **Universal Abstraction**: Does NOT just store communications. It is an event sink.
- **Event Insert**: Done synchronously inside the business transaction.
- **Locking**: Workers poll using `SELECT ... FOR UPDATE SKIP LOCKED` combined with `WHERE status = 'PENDING' AND next_retry_at <= now()`.
- **Idempotency Key**: Generated uniquely (e.g., `message_id + '_dispatch'`). `ON CONFLICT (idempotency_key) DO NOTHING` guarantees no double-queuing.
- **DLQ Behavior**: If `attempts >= max_attempts`, `status` transitions to `DLQ`. Requires manual/admin intervention.
- **Compatibility**: Future migration will route `HOMEWORK_PUBLISHED` events through this exact table.

## 6. Delivery Architecture
`Business TX (message status = QUEUED) -> INSERT platform_events -> Commit`
`Worker -> SELECT SKIP LOCKED -> rpc_resolve_recipients() -> Check Preferences -> INSERT communication_recipients -> Call FCM/Resend -> Update platform_events (COMPLETED)`
- **Channels**: In-App, Push (FCM/APNs), Email. SMS explicitly omitted (V2).

## 7. Idempotency & Retries
- **Provider Duplicate**: Worker passes a unique deterministic `Idempotency-Key` HTTP header to Resend/FCM.
- **Worker Crash**: If worker crashes after provider success but before DB update, the `next_retry_at` is reached. Worker retries. Provider sees the `Idempotency-Key` header and returns `200 OK` (cached success) without re-sending. Worker updates DB to `COMPLETED`.
- **Duplicate Send Request**: RLS and state checks `WHERE status = 'DRAFT'` prevent a double RPC call from enqueueing twice.

## 8. Retention
- **Ephemeral**: 90-day default via `expires_at` column.
- **Official**: Driven by org configuration (can be infinite).
- **Purge Job**: A `pg_cron` worker hard-deletes `communication_messages` rows where `expires_at < now()`. 
- **Audit Preservation**: Deletion cascades to `communication_recipients`, but `communication_audit_logs` retains delivery facts (de-identified counts). Replays are strictly impossible post-purge because the payload is destroyed.

## 9. Attachments
- **Storage Pattern**: Uses a private Supabase Storage bucket `communication_attachments`.
- **Authorization**: `fn_check_message_access()` maps to bucket RLS. Sender has full access. Recipients have read-only access.
- **Branch Isolation**: Path pattern: `branch_id/message_id/file_uuid`.
- **Validation**: Uploads restricted to 10MB, safe mime-types.

## 10. Templates
- **Design**: `communication_templates` scoped to `branch_id`.
- **Variables**: Driven by `variables_schema` (JSON Schema). Strict server-side variable replacement via Handlebars/regex. Arbitrary DB lookups via template variables are explicitly banned to prevent data exfiltration.

## 11. Notification Preferences
- **Resolution**: Worker checks `user_notification_preferences` before routing to FCM/Email.
- **Mandatory**: Certain `topics` (e.g., 'EMERGENCY') bypass user preferences based on branch policy.
- **Quiet Hours**: Deferred to V2 (mobile OS level "Do Not Disturb" handles this effectively for V1).

## 12. Rate Limiting / Abuse
- **Mechanism**: API Gateway / Edge Function token-bucket rate limits.
- **Limits**: Teachers limited to X announcements/day. Branch admins limited to Y branch-wide blasts/day.
- **Tracking**: Recorded in `communication_audit_logs` as `RATE_LIMITED`.

## 13. API / RPC Contracts
All data mutation happens via explicit, locked `SECURITY DEFINER` RPCs:
- `rpc_create_message(branch_id, subject, body, targets, type)` -> returns `message_id`
- `rpc_schedule_message(message_id, scheduled_for)`
- `rpc_send_message(message_id)` -> transitions to QUEUED, inserts outbox.
- `rpc_mark_read(message_id)` -> Updates `communication_recipients`.
- `rpc_resolve_recipients(targets)` -> Returns recipient count (Admin/Teacher only).

## 14. Concurrency
- **Duplicate Publish**: `UPDATE communication_messages SET status = 'QUEUED' WHERE id = X AND status IN ('DRAFT', 'SCHEDULED')`. If 0 rows updated, throw error (already sent).
- **Two Workers**: `SKIP LOCKED` natively prevents two workers from processing the same outbox row.
- **Purge vs Read**: Deletes are standard Postgres atomic operations. In-flight reads succeed or return 404 cleanly.

## 15. Performance
- **Indexes**: 
  - `CREATE INDEX idx_outbox_pending ON platform_events(status, next_retry_at) WHERE status = 'PENDING';`
  - `CREATE INDEX idx_recipients_user ON communication_recipients(recipient_id, delivery_status);`
- **Asynchronous Expansion**: Client does not wait for 5,000 recipients to be inserted. Client calls `rpc_send_message` and gets 200 OK instantly. Worker handles the O(N) expansion.

## 16. Test Matrix
- **pgTAP/RLS**: 
  - Teacher cross-section denial.
  - Branch admin cross-branch denial.
  - Guardian reading other student's messages denial.
- **Concurrency**: Simulate 2 simultaneous `rpc_send_message` calls.
- **Worker/Idempotency**: Inject fake provider failures, verify retry logic and DLQ routing.
- **E2E / Playwright**: Verify Teacher UI only shows assigned sections in the target dropdown.

## 17. Work-Efficiency Requirements
- **Contextual Selection**: Dropdown automatically populates with the Teacher's active sections.
- **Zero-Click Targeting**: "Send to Class" sends to all valid guardians natively; teacher does not have to click 30 checkboxes.
- **Smart Defaults**: Ephemeral expiration auto-populates for Attendance/Homework alerts.

## 18. Consistency Audit Results
- **Notification Architecture**: Fully genericized. `platform_events` serves as the robust foundation.
- **API Architecture**: RPC-first state transitions protect complex multi-table inserts.
- **RBAC/RLS**: Matches Phase 2 boundaries perfectly.
- **Storage**: Mirrors Phase 5 Homework architecture completely.
- **Data Architecture**: De-normalizes targeting into `message_targets` while strictly tracking final delivery in `recipients`.
- **Homework/Attendance**: `platform_events` is confirmed compatible with existing emitting logic.
-   * * B r a n c h   A p p   F a c t o r y * * :   C o m p a t i b l e .   D e f e r s   p u s h   t o k e n   r o u t i n g   t o   E x p o / F C M   e d g e   f u n c t i o n s   s e a m l e s s l y   m a p p e d   v i a   b r a n c h _ i d   a s   r e q u i r e d .  
 