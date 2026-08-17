# SchoolOS — Phase 1A Architecture Decision Report

## 1. Executive Summary

This report establishes the foundational technology stack and architectural baseline for SchoolOS. Extensive evaluation of various frameworks and platforms was performed to support a multi-tenant, centralized database architecture capable of driving a "Branch App Factory" for hundreds of distinct schools, while being maintainable by a small engineering team using AI-assisted development. The recommended baseline heavily relies on Supabase and Expo to minimize operational overhead.

## 2. Decisions Made

- **Backend & Database:** Supabase (PostgreSQL with native RLS).
- **Database Tenancy:** Single centralized database with `organization_id` and `branch_id`.
- **Mobile Framework:** Expo (React Native).
- **Authentication:** Supabase Auth.
- **CI/CD:** GitHub Actions + Expo Application Services (EAS).
- **Stitch Integration:** StitchMCP (No CLI dependencies).
- **Super Admin:** Web-only initially, with global cross-branch context.
- **Storage:** Supabase Storage with RLS boundary isolation.
- **Offline Support:** Cached read with offline write queues only for non-destructive operations (e.g., Attendance).

## 3. Decisions Still Open

- **Payment Gateway:** Final selection of payment processors for handling multi-branch fee collections.
- **SMS Gateway:** Specific vendor selection for transactional SMS in the target region.
- **Enterprise App Distribution:** Whether to bypass public App Stores entirely for B2B iOS distribution via Apple Custom Apps.

## 4. Technology Comparison

- **Mobile Framework:** Expo outperforms Flutter and bare React Native due to its EAS build service, which makes injecting dynamic branch variables (bundle IDs, package names, icons) trivial at build time.
- **Backend:** Supabase provides native PostgreSQL Row-Level Security, which is critical for our centralized database approach, and eliminates the need to build and maintain a custom API and auth middleware.
- **Database Tenancy:** A single centralized database is cheaper, easier to migrate, and simplifies cross-branch reporting for Super Admins. Separating schemas or databases per branch would create an unmanageable migration burden at 100+ branches.

## 5. Recommended Architecture

| Layer         | Recommended | Reason | Alternatives rejected |
| ------------- | ----------- | ------ | --------------------- |
| Web           | Next.js     | React ecosystem compatibility with Expo. | Vue/Nuxt, Svelte |
| Mobile        | Expo (React Native) | Unmatched Branch App Factory capabilities via EAS. | Flutter, Native |
| Backend       | Supabase    | Native RLS, built-in Auth, rapid AI iteration. | Custom Node.js, Firebase |
| Database      | PostgreSQL  | Relational integrity and advanced RLS. | MongoDB, MySQL |
| Auth          | Supabase Auth | Native integration with Postgres RLS. | Auth0, Firebase |
| Storage       | Supabase Storage | RLS support for buckets. | AWS S3 directly |
| API           | PostgREST (Supabase) | Automatic API generation. | Custom GraphQL/REST |
| Notifications | Firebase (FCM) | Reliable push with custom data payloads. | APNs only |
| Testing       | Jest + Playwright | Industry standard, covers E2E web and components. | Cypress |
| CI/CD         | GitHub Actions + EAS | Solves the multi-app build problem natively. | Bitrise, Jenkins |
| Hosting       | Vercel (Web) + Supabase | Zero-config edge hosting. | AWS EC2 |
| Monitoring    | Sentry      | Cross-platform error tracking. | Datadog |
| Design        | Stitch      | Native MCP integration with Antigravity. | Figma export plugins |

## 6. Branch App Factory Architecture

Using Expo and EAS, a single shared React Native codebase will produce separate apps:
- **Configuration:** An `app.config.js` reads environment variables (e.g., `BRANCH_ID=branch_A`) at build time to dynamically set the `ios.bundleIdentifier`, `android.package`, name, and icon paths.
- **CI/CD Scale:** At 5 branches, manual EAS triggers are fine. At 100+ branches, the pipeline will only trigger builds for specific branches when branch-specific assets change, or execute a staggered cron job for major global releases to avoid hitting EAS limits.
- **Store Deployment:** EAS Submit will push directly to the respective App Store and Google Play tracks.

## 7. Security Architecture (RBAC + RLS)

- **Centralized Enforcement:** Supabase Auth issues JWTs containing the user's `branch_id` and `role`.
- **RLS Policies:** Every database query automatically filters rows where `branch_id = auth.jwt() ->> 'branch_id'`. This prevents branch ID tampering from the client.
- **Role Escalation:** Users cannot modify their own roles. Roles are assigned strictly by Branch Admins.
- **Super Admin:** Super Admins receive a specific JWT claim bypassing standard branch RLS, but all mutations are captured in a separate immutable `audit_logs` table via Postgres triggers.

## 8. Testing Architecture

- **Web:** Playwright for E2E.
- **Mobile:** Expo Go for manual QA, Maestro for E2E flows.
- **Database:** `pgTAP` for writing automated unit tests specifically for RLS policies (crucial for security).
- **CI Gates:** All PRs must pass `pgTAP` RLS tests and web component tests before merging.

## 9. Stitch Integration

- **Current State:** The legacy `stitch` CLI is not present or supported.
- **Integration Workflow:** Antigravity will interact directly with the `StitchMCP` server. 
- **Workflow:** Requirements -> Stitch UI -> Generate Screens -> Upload Design MD via MCP -> Antigravity Code Implementation.

## 10. CI/CD Architecture

- **Commit:** Linters and `pgTAP` database tests run automatically.
- **Merge:** Web dashboard deploys automatically to Vercel.
- **Mobile Builds:** Branch apps do NOT build on every commit. They are triggered on-demand or batched during designated release windows using GitHub Actions Matrix strategies targeting EAS Build.

## 11. Offline Recommendation

- **No Offline:** Payments, Exams, Role Changes, Permissions.
- **Cached Read (Read-Only):** Timetable, Announcements.
- **Offline Write Queue:** Attendance, simple task completions. (Implemented using standard React Native offline queues, synced upon reconnection, last-write-wins).

## 12. Client Data Export / Offboarding Strategy

Since data is centralized, a single branch leaving cannot take a `.sql` dump directly.
- **Strategy:** Build a "Branch Export Job" via Supabase Edge Functions.
- **Process:** The function queries all tables filtering by the requested `branch_id`, generates a normalized JSON/CSV archive, and uploads it to a secure storage bucket.
- **Deletion:** Post-export, branch data is soft-deleted (archived) for 30 days before a hard cascade delete permanently removes the branch's footprint.

## 13. Cost/Complexity Concerns

- **Cost:** Supabase Compute scaleups and EAS Build minutes will be the primary cost drivers as branches exceed 100+.
- **Complexity:** Managing 100+ Apple Developer accounts and Google Play Console environments is the highest operational friction point.

## 14. Risks

1. Misconfigured RLS leading to catastrophic cross-branch data exposure.
2. Expo Application Services (EAS) queue limits when trying to build 100+ apps simultaneously.
3. Apple App Store rejection for "spamming" similar apps (Design Guideline 4.3), requiring Apple Business Manager custom app distribution.

## 15. Next Implementation Phase

The next step is Phase 1B: ERP Foundation Implementation, starting with the database schema, RLS policies, and Auth integration.

---

ARCHITECTURE BASELINE APPROVED
