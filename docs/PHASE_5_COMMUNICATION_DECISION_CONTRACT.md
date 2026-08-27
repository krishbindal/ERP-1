# Phase 5 — Communication (Decision Contract)

## 1. Module Scope & Definition

The **Communication** module establishes a secure, compliant, multi-channel messaging and notification architecture for SchoolOS. It governs how the school (Admins and Teachers) communicates with its stakeholders (Students and Guardians).

### Finalized Scope
- **One-Way Communication**: V1 is strictly One-Way (School → Home). There is NO two-way teacher/guardian direct messaging in V1.
- **Announcements**: Branch-wide, Class-wide, or Section-wide official broadcast messages.
- **Notifications**: System-generated ephemeral alerts (e.g., Attendance absence, Homework published).

### Finalized Channels
- **In-App / Web**: Persistent inbox within the SchoolOS portal. (V1)
- **Push Notifications (FCM/APNs)**: Mobile app alerts leveraging ADR 005. (V1)
- **Email**: Transactional emails for high-priority alerts. (V1)
- **SMS**: Explicitly deferred to V2. However, the core event architecture must remain channel-extensible so SMS can be dropped in seamlessly later.

## 2. Research Findings & Industry Standards

### Compliance (FERPA, COPPA, GDPR)
- **Least Privilege & Role-Based Access**: The system must enforce strict recipient enumeration prevention. Users should not be able to list all users in a branch; they can only resolve recipients they are authorized to contact.
- **Data Minimization & Retention**: Communication logs cannot be kept indefinitely without purpose. We must establish a clear, multi-tiered retention policy.
- **Consent Boundaries**: Guardian communication preferences must be respected.

### Reliability (High-Volume Notification Architecture)
- **Transactional Outbox**: Notifications must never corrupt the critical path of the database transaction. 
- **Idempotency**: All messages must carry an `idempotency_key` to guarantee "exactly-once" processing and prevent duplicate emails/pushes during retry storms.
- **Resilience**: The relay worker (Supabase Edge Function / pg_cron) will process the outbox asynchronously using `SELECT ... FOR UPDATE SKIP LOCKED` and apply exponential backoff.

## 3. Finalized Product Decisions

### 3.1 Recipient & Identity Rules (Contextual Resolution)
Contextual recipient resolution is a core V1 UX/product capability.
- **Branch Admins**: Can dynamically resolve and communicate Branch-wide (all staff, all students, all guardians).
- **Teachers**: Can dynamically resolve and communicate *only* with Students and Guardians linked to their active `teacher_subject_assignments` or assigned classes.
- **Guardians**: Strictly read-only receivers in V1 (One-Way).
- **Students**: Strictly read-only receivers in V1 (One-Way). 

### 3.2 Message Lifecycle & Retention
1. **DRAFT**: Created but not queued.
2. **SCHEDULED**: Queued for a future timestamp.
3. **SENT**: Dispatched to the outbox relay.
4. **DELIVERED**: Acknowledged by the provider (Push/Email) or marked "Read" in-app.
5. **FAILED**: Provider rejected or dead-letter queue (DLQ) threshold reached.

**Retention Policy**:
- **Ephemeral System Notifications**: Default to a strict 90-day retention auto-purge.
- **Official Announcements**: Follow a configurable organizational retention policy (no forced permanent retention).
- **Delivery/Audit Retention**: Maintained completely separately from message retention to preserve historical delivery facts even if message body/payload is purged.

### 3.3 Reliability & Platform Outbox Abstraction
Instead of directly generalizing `homework_events` strictly for communication, we will introduce a **Reusable Platform Outbox/Event Abstraction**. 
- A generic `platform_events` or `system_outbox` table will exist, suitable for ALL domains (Attendance, Homework, Communication, etc.).
- Database transactions atomically insert standardized polymorphic event payloads into this universal outbox.
- Domain-specific workers (or a central router) drain this queue based on the `topic` or `event_type`.

### 3.4 Security & RLS
- **Cross-Branch Isolation**: Strict RLS ensuring `sender` and `recipient` exist in the same `branch_id`.
- **Private Attachments**: Communications may include attachments stored in Supabase Storage. Access is strictly bound to the message recipient list via Postgres `SECURITY DEFINER` helpers, perfectly preserving existing boundaries.
- **Rate Limiting**: Implementation of API-level rate limiting for sending messages to prevent spam/abuse (especially from compromised accounts).

## 4. Master Consistency Audit

This decision contract has been rigorously audited against the established SchoolOS master documents:

- **Notification Architecture**: Fully aligned. Replaces bespoke module outboxes with a unified Platform Outbox abstraction that safely scales and supports idempotency.
- **API & UX**: Aligned. Introduces "Contextual Recipient Resolution" via secure `SECURITY DEFINER` RPCs to prevent client-side enumeration attacks and massive payload limits, perfectly matching the required REST bounds.
- **Storage**: Aligned. Reuses the exact same hardened `SECURITY DEFINER` capability proven in the Homework module to strictly protect attachments without breaking the unified Storage bucket pattern.
- **RBAC & RLS**: Aligned. 100% preservation of all existing `branch_memberships`, `enrollments`, `student_guardians`, and `teacher_subject_assignments` boundaries. No legacy bypasses introduced.
- **Data Architecture**: Aligned. Separates Delivery/Audit logs from Message retention logically, adhering to the data lifecycle and normalization standards.
- **Change Control**: Aligned. No existing structural schemas are destructively modified.
