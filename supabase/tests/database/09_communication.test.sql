BEGIN;

SELECT plan(15);

-- 1. Structural Checks
SELECT has_table('public', 'communication_messages', 'communication_messages exists');
SELECT has_table('public', 'communication_recipients', 'communication_recipients exists');
SELECT has_table('public', 'communication_delivery_attempts', 'delivery attempts exists');
SELECT has_table('public', 'platform_events', 'platform_events outbox exists');

-- 2. Security / Privilege Checks
SELECT table_privs_are('public', 'communication_messages', 'public', ARRAY[]::text[], 'Public has no access to messages');
SELECT function_privs_are('public', 'rpc_create_message', ARRAY['uuid', 'text', 'text', 'text', 'jsonb', 'timestamp with time zone', 'timestamp with time zone'], 'public', ARRAY[]::text[], 'Public cannot create messages');
SELECT function_privs_are('public', 'rpc_send_message', ARRAY['uuid'], 'public', ARRAY[]::text[], 'Public cannot send messages');
SELECT function_privs_are('public', 'rpc_schedule_message', ARRAY['uuid', 'timestamp with time zone'], 'public', ARRAY[]::text[], 'Public cannot schedule messages');

-- 3. Idempotency Check on Platform Events
PREPARE insert_event AS 
    INSERT INTO public.platform_events (organization_id, aggregate_type, aggregate_id, event_type, payload, idempotency_key)
    VALUES (gen_random_uuid(), 'msg', gen_random_uuid(), 'queued', '{}'::jsonb, 'idem-123');

SELECT lives_ok('insert_event', 'First insert succeeds');
SELECT throws_ok('insert_event', '23505', NULL, 'Duplicate idempotency key throws unique violation');

-- 4. RLS & Isolation (Mock check)
-- Because we don't have the full seeded graph in this script, we can verify that the policies are ACTIVE
SELECT policies_are('public', 'communication_messages', ARRAY[
    'Users can view messages they sent or received'
], 'Messages RLS policies are correct');

SELECT policies_are('public', 'communication_recipients', ARRAY[
    'Users can view their own receipts and sent receipts'
], 'Recipients RLS policies are correct');

SELECT policies_are('public', 'communication_delivery_attempts', ARRAY[
    'Users can view attempts for messages they sent or receive'
], 'Delivery attempts RLS policies are correct');

-- 5. Rate limit function presence
SELECT has_function('public', 'fn_check_rate_limits', 'Rate limit function exists');

-- 6. Teacher auth function presence
SELECT has_function('public', 'fn_is_teacher_authorized', 'Teacher section auth function exists');

SELECT * FROM finish();
ROLLBACK;
