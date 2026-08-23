# Phase 5 — Communication (Decision Contract)

## 1. Module Scope & Definition

The **Communication** module establishes a secure, compliant, multi-channel messaging and notification architecture for SchoolOS. It governs how the school (Admins and Teachers) communicates with its stakeholders (Students and Guardians).

### Scope
- **Announcements**: Branch-wide, Class-wide, or Section-wide broadcast messages.
- **Direct Messaging**: 1-to-1 or 1-to-many targeted communication.
- **Notifications**: System-generated alerts (e.g., Attendance absence, Homework published).

### Channels
- **In-App / Web**: Persistent inbox within the SchoolOS portal. (V1)
- **Push Notifications (FCM/APNs)**: Mobile app alerts leveraging ADR 005. (V1)
- **Email**: Transactional emails for high-priority alerts. (V1)
- **SMS**: Deferred to V2 (pending region-specific gateway vendor selection as per Phase 1A ADR).

## 2. Research Findings & Industry Standards

### Compliance (FERPA, COPPA, GDPR)
- **Least Privilege & Role-Based Access**: The system must enforce strict recipient enumeration prevention. Users should not be able to list all users in a branch; they can only resolve recipients they are authorized to contact.
- **Data Minimization & Retention**: Communication logs cannot be kept indefinitely without purpose. We must establish a clear retention policy (e.g., auto-archiving ephemeral read-alerts after 90 days, retaining official conduct messages based on school policy).
- **Consent Boundaries**: Guardian communication preferences must be respected, and COPPA requires restricting ad-hoc peer-to-peer student messaging without supervision.

### Reliability (High-Volume Notification Architecture)
- **Transactional Outbox**: Notifications must never corrupt the critical path of the database transaction. We will implement the Transactional Outbox Pattern (similar to the successful `homework_events` pattern).
- **Idempotency**: All messages must carry an `idempotency_key` to guarantee "exactly-once" processing and prevent duplicate emails/pushes during retry storms.
- **Resilience**: The relay worker (Supabase Edge Function / pg_cron) will process the outbox asynchronously using `SELECT ... FOR UPDATE SKIP LOCKED` and apply exponential backoff.

## 3. Recommended Product Decisions

### 3.1 Recipient & Identity Rules
- **Branch Admins**: Can communicate Branch-wide (all staff, all students, all guardians).
- **Teachers**: Can communicate *only* with Students and Guardians linked to their active `teacher_subject_assignments` or assigned classes.
- **Guardians**: Can communicate *only* with Teachers assigned to their enrolled children.
- **Students**: Broadcast/1-way reception only in V1. Peer-to-peer student messaging is explicitly disabled in V1 to reduce moderation and COPPA liability.

### 3.2 Message Lifecycle
1. **DRAFT**: Created but not queued.
2. **SCHEDULED**: Queued for a future timestamp.
3. **SENT**: Dispatched to the outbox relay.
4. **DELIVERED**: Acknowledged by the provider (Push/Email) or marked "Read" in-app.
5. **FAILED**: Provider rejected or dead-letter queue (DLQ) threshold reached.

### 3.3 Reliability & Outbox Model
We will generalize the `homework_events` pattern into a `public.communication_outbox` table. Database transactions (like marking attendance or publishing an announcement) will atomically insert an event into this table. A separate worker will drain this queue, invoke FCM/Email providers, handle retries, and update delivery status.

### 3.4 Security & RLS
- **Cross-Branch Isolation**: Strict RLS ensuring `sender` and `recipient` exist in the same `branch_id`.
- **Private Attachments**: Communications may include attachments stored in Supabase Storage. Access is strictly bound to the message recipient list via Postgres `SECURITY DEFINER` helpers, mirroring the Homework security patch.
- **Rate Limiting**: Implementation of API-level rate limiting for sending messages to prevent spam/abuse (especially from compromised accounts).

### 3.5 Templates & Bulk Operations
- **Templates**: Branch admins can define reusable templates with basic variable substitution (e.g., `{{student_name}}`).
- **Batching**: Bulk recipient resolution happens server-side. The client sends a target group (e.g., `section_id=123`), and the database expands this into individual recipient outbox events to prevent massive payload transmission over the network.

## 4. Decisions Requiring Explicit Approval

1. **Two-Way vs. One-Way**: Should V1 strictly be One-Way (Announcements/Broadcasts from School to Home) or should we allow Two-Way Direct Messaging (Guardians replying to Teachers)? *Recommendation: Start with One-Way + System Notifications to establish reliability, pushing Two-Way Chat to V2.*
2. **SMS Gateway**: Should SMS be strictly deferred to V2 as planned, or is there an immediate requirement for absentee SMS alerts in V1?
3. **Retention Policy**: Should we implement a strict 90-day auto-purge for ephemeral system notifications (e.g., "Homework Published"), while keeping official Announcements indefinitely?

## 5. Security & Data Implications
- **Recipient Enumeration**: We must not expose the global `students` or `guardians` tables. We need secure RPCs like `rpc_resolve_recipients(section_id)` that only return data the caller is authorized to see.
- **Service Role Boundaries**: The Edge Function draining the `communication_outbox` will run with the `service_role` key but must strictly respect the idempotency keys and payload constraints.

## 6. Architecture & Implementation Reuse
- **Reused Architecture**: Supabase Auth (Identity), FCM via Expo (ADR 005), Supabase Edge Functions (Workers).
- **Reused Implementation**: 
  - `teacher_subject_assignments` for class-level authorization.
  - `student_guardians` for automated parent routing.
  - `homework_events` pattern (will be refactored into a general `communication_outbox`).
