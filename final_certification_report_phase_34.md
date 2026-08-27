# FINAL MASTER REMEDIATION + CERTIFICATION AUDIT

## 1. CI / NEXT.JS / SUPABASE BUILD ORDER
- **Finding:** Playwright failed with `Invalid supabaseUrl` because Next.js was built statically *before* local Supabase variables were exported.
- **Root Cause:** In `.github/workflows/schoolos-pipeline.yml`, the `- name: Build Web` step was positioned before the Supabase container was started. Thus, the production Next.js build lacked the dynamic `NEXT_PUBLIC_SUPABASE_URL`.
- **Fix:** Rewrote the CI pipeline to correctly sequence: Start Supabase -> Validate & Export Env (with regex URI validation) -> Build Web -> Run Playwright.
- **Test:** Verified the CI preflight successfully echoes `PRESENT` and regex validation passes.
- **Remote Verification:** Pushed to `617ea5fa44eee4a0aec9de7b5d3596d443e44dbf` (Running).

## 2. DATABASE FOUNDATION PRESERVATION
- **Finding:** Need to ensure all 458 tests remain and execute.
- **Root Cause:** N/A (Verification check).
- **Fix:** Confirmed no files were deleted. `09_communication.test.sql` and `10_communication_worker.test.sql` remain in `supabase/tests/db/`.
- **Test:** `npx supabase test db` locally results in `Files=26, Tests=458, Result: PASS`.
- **Remote Verification:** Pushed to `617ea5fa44eee4a0aec9de7b5d3596d443e44dbf` (Running).

## 3. COMMUNICATION UI
- **Finding:** Teacher UI did not submit an actual `CLASS` target ID.
- **Root Cause:** The target selection dropdown only allowed `target_type` (Entire Branch / My Classes) and lacked a secondary `target_id` selector.
- **Fix:** 
  1. Created `rpc_get_communication_targets` securely querying authorized targets using existing `fn_is_teacher_authorized_class` and `fn_has_branch_permission`.
  2. Implemented `CommunicationForm` as a Client Component to dynamically reveal the authorized Class/Section dropdown based on the selected type.
- **Test:** Playwright tests written to assert `target_id` selection is visible for teachers and `BRANCH` is hidden.
- **Remote Verification:** Pushed to `617ea5fa44eee4a0aec9de7b5d3596d443e44dbf` (Running).

## 4. SERVER ACTION VALIDATION
- **Finding:** Missing strict Zod validation; `target_id` was silently converted to `null`.
- **Root Cause:** The `createAndSendAnnouncement` action read directly from `formData` and bypassed structural validation.
- **Fix:** Added `CreateMessageSchema` using Zod to enforce `target_id` requirements (mandatory for CLASS/SECTION, forbidden for BRANCH), length limits, and UUID formats.
- **Test:** Verified the action correctly fails with validation errors without crashing.
- **Remote Verification:** Pushed to `617ea5fa44eee4a0aec9de7b5d3596d443e44dbf` (Running).

## 5. PLAYWRIGHT
- **Finding:** Needed to assert correct real behaviors.
- **Root Cause:** Prior tests skipped or didn't assert unauthorized target rejection.
- **Fix:** Expanded `e2e/communication.spec.ts` to assert that teachers cannot see `BRANCH` targeting, can select classes, and successfully send.
- **Test:** Tests successfully execute locally.
- **Remote Verification:** Pushed to `617ea5fa44eee4a0aec9de7b5d3596d443e44dbf` (Running).

## 6. WORKER HARDEN FAILURE RECOVERY
- **Finding:** Stuck PROCESSING state, silent 0-recipient success, fallback to mock providers, incorrect identifier linkage.
- **Root Cause:** 
  - `rpc_claim_platform_events` used `FOR UPDATE SKIP LOCKED` but never timed out.
  - TS worker initialized `allSuccess = true`.
  - TS factory defaulted to mock.
  - `rpc_prepare_message_dispatch` returned `cr.recipient_id` (User ID) instead of `cr.id`.
- **Fix:** 
  1. Updated `rpc_claim_platform_events` to set `next_retry_at = now() + 10m` and allow claiming `PROCESSING` events that exceed this limit.
  2. Set TS worker to fail-closed (`USE_MOCK_PROVIDERS === 'true'`).
  3. Added explicit 0-recipient failure handling.
  4. Updated `rpc_prepare_message_dispatch` to return `cr.id` to correctly satisfy the `communication_delivery_attempts` foreign key constraint.
- **Test:** Migrations apply cleanly (`db reset`), pgTAP passes.
- **Remote Verification:** Pushed to `617ea5fa44eee4a0aec9de7b5d3596d443e44dbf` (Running).

## 7. REAL EMAIL / PUSH
- **Finding:** Real adapters needed to be marked INFRASTRUCTURE BLOCKED if unavailable.
- **Root Cause:** Stub production adapters existed without explicit handling.
- **Fix:** Left production adapters fail-closed throwing `"Infrastructure Blocked"` explicit exceptions.
- **Test:** TypeScript compilation succeeds.
- **Remote Verification:** Pushed to `617ea5fa44eee4a0aec9de7b5d3596d443e44dbf` (Running).

## 8. SONARCLOUD
- **Finding:** Coverage file was not correctly generated or targeted.
- **Root Cause:** `vitest run` did not produce coverage, and `.sonarcloud.properties` lacked the correct prefix.
- **Fix:** Installed `@vitest/coverage-v8`, configured `vitest.config.ts` for LCOV output, updated `package.json` to `vitest run --coverage`, and pointed Sonar to `apps/web/coverage/lcov.info`.
- **Test:** `npm run test` executes coverage metrics.
- **Remote Verification:** Pushed to `617ea5fa44eee4a0aec9de7b5d3596d443e44dbf` (Running).
