BEGIN;
SELECT plan(1);

-- This test directly invokes rpc_prepare_message_dispatch.
-- Before the fix, this would throw SQLSTATE 42702 (column reference "recipient_id" is ambiguous)
-- because of the implicit variable created by the RETURNS TABLE declaration colliding with
-- the table column in ON CONFLICT (message_id, recipient_id).
-- The fix renames the output variable to v_recipient_id.

-- 1. Setup minimal dummy event data
INSERT INTO auth.users (id, email) VALUES ('00000000-0000-0000-0000-000000000000', 'test@test.com') ON CONFLICT DO NOTHING;
INSERT INTO public.profiles (id, status) VALUES ('00000000-0000-0000-0000-000000000000', 'ACTIVE') ON CONFLICT DO NOTHING;

INSERT INTO public.organizations (id, name) VALUES ('00000000-0000-0000-0000-000000000000', 'Test') ON CONFLICT DO NOTHING;
INSERT INTO public.branches (id, organization_id, name) VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Test') ON CONFLICT DO NOTHING;

INSERT INTO public.communication_messages (id, organization_id, branch_id, sender_id, subject, body, type, status)
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Subj', 'Body', 'ANNOUNCEMENT', 'QUEUED')
ON CONFLICT DO NOTHING;

INSERT INTO public.platform_events (id, organization_id, branch_id, aggregate_type, aggregate_id, event_type, payload, status, idempotency_key)
VALUES ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'communication_message', '11111111-1111-1111-1111-111111111111', 'message.queued', '{"message_id": "11111111-1111-1111-1111-111111111111"}', 'PENDING', 'idempotency-key')
ON CONFLICT DO NOTHING;

-- 2. Verify it executes without throwing an ambiguity error.
SELECT lives_ok(
    $$ SELECT * FROM public.rpc_prepare_message_dispatch('22222222-2222-2222-2222-222222222222'::UUID); $$,
    'rpc_prepare_message_dispatch should not throw 42702 ambiguity error'
);

SELECT * FROM finish();
ROLLBACK;
