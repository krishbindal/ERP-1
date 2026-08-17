# SchoolOS — Architecture Decision Log

## ADR 001: Centralized Database Tenancy
- **Status:** Accepted
- **Context:** We need a multi-tenant database strategy for SchoolOS that supports a Branch App Factory without becoming an operational nightmare.
- **Decision:** Use a single centralized database with `organization_id` and `branch_id` columns, strongly isolated by PostgreSQL Row-Level Security (RLS).
- **Consequences:** Easier migrations, lower costs, and simpler Super Admin reporting, but carries a high risk of cross-branch data leakage if RLS is improperly configured.

## ADR 002: Backend and Database Platform
- **Status:** Accepted
- **Context:** We need a robust backend with built-in RLS, auth, and API capabilities suitable for a small engineering team using AI-assisted development.
- **Decision:** Use **Supabase**.
- **Consequences:** Fast time-to-market, unified Auth + Postgres + Storage + Edge Functions, and native RLS integration. Vendor lock-in is mitigated because it is fundamentally standard PostgreSQL.

## ADR 003: Mobile Framework for Branch App Factory
- **Status:** Accepted
- **Context:** We need a framework capable of generating hundreds of distinct, branded iOS and Android apps from a single shared codebase.
- **Decision:** Use **Expo (React Native)**.
- **Consequences:** EAS (Expo Application Services) provides environment variables and dynamic `app.config.js` to effortlessly swap bundle IDs, package names, icons, and splash screens at build time. Avoids maintaining separate iOS/Android code.

## ADR 004: Authentication Provider
- **Status:** Accepted
- **Context:** We need a secure, scalable Auth solution that natively integrates with our database RLS.
- **Decision:** Use **Supabase Auth**.
- **Consequences:** Eliminates syncing user state between an external provider (like Auth0) and the database. Simplifies RLS policies by reading `auth.uid()` directly.

## ADR 005: Notification Architecture
- **Status:** Accepted
- **Context:** We need multi-branch push notifications where each branch app has a unique package/bundle ID.
- **Decision:** Use **Firebase Cloud Messaging (FCM)** via Expo push tokens, mapped by branch ID on the backend using Supabase Edge Functions.
- **Consequences:** Centralized notification processing. Avoids managing hundreds of separate APNs certificates manually.

## ADR 006: CI/CD Pipeline
- **Status:** Accepted
- **Context:** Building hundreds of mobile apps per commit is unscalable.
- **Decision:** Use **GitHub Actions + Expo Application Services (EAS)**. Web/backend builds on every commit. Mobile apps only build for specific branches triggered via manual dispatch or scheduled releases.
- **Consequences:** Reduces CI costs while ensuring scalability.

## ADR 007: Stitch Integration
- **Status:** Accepted
- **Context:** Integrating Stitch with Antigravity for UI design.
- **Decision:** Use the built-in **StitchMCP** directly within Antigravity. Do not use legacy Stitch CLI commands as they are deprecated and unavailable in the current environment.
- **Consequences:** Streamlines the design-to-code workflow inside the agent's context using native MCP tools.

## ADR 008: Final Membership Model
- **Status:** Accepted
- **Context:** Users may belong to multiple branches or have overlapping organizational scopes (e.g., Super Admin vs Branch Admin, Parents with children in different branches).
- **Decision:** Implement explicit junction tables: `organization_memberships` and `branch_memberships`. A single user profile maps to many branch memberships. Role assignments are scoped to the branch membership.
- **Consequences:** Fully supports users spanning branches safely. Requires RLS to check `EXISTS (SELECT 1 FROM branch_memberships...)` instead of a simple JWT claim.

## ADR 009: JWT Claims Strategy
- **Status:** Accepted
- **Context:** Relying solely on `branch_id` in the JWT is insufficient for multi-branch users and opens security holes if they alter their app context.
- **Decision:** JWT will strictly contain immutable/semi-immutable identity claims (e.g., `user_id`, `org_id`, and `is_super_admin`). Branch context and role evaluation will be performed dynamically in Postgres using security definer functions against the membership tables.
- **Consequences:** Slightly higher database read load (mitigated by Postgres function caching/STABLE functions) but infinitely more secure and flexible than trusting client-provided branch IDs.

## ADR 010: App Distribution Strategy
- **Status:** Accepted
- **Context:** Apple App Store guidelines (4.3 Spam) make it difficult to publish hundreds of identical white-labeled branch apps to the public App Store.
- **Decision:** **Hybrid Distribution**. Parent/Student apps are unified into one public portal app (where they log in and download branch configs OTA). Teacher and Admin apps are distributed via Apple Custom Apps (Apple Business Manager) and unlisted Google Play tracks since they are internal business tools.
- **Consequences:** Massively reduces app review friction for the consumer side while retaining full white-labeling capabilities for internal staff.

## ADR 011: Branch Offboarding Strategy
- **Status:** Accepted
- **Context:** Centralized databases make it difficult to "hand over" a branch's database.
- **Decision:** Implement an asynchronous "Export Branch" Supabase Edge Function that dumps all related data into a secure JSON/CSV archive in Supabase Storage, followed by soft-deletion.
- **Consequences:** Solves the client data ownership requirement securely without fundamentally altering the centralized database topology.
