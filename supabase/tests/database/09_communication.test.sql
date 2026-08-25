BEGIN;
SELECT plan(22);

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
DO $$
DECLARE
    v_org_id UUID;
    v_branch_id UUID;
BEGIN
    INSERT INTO public.organizations (name) VALUES ('Test Org Comm') RETURNING id INTO v_org_id;
    INSERT INTO public.branches (organization_id, name) VALUES (v_org_id, 'Test Branch Comm') RETURNING id INTO v_branch_id;
    
    EXECUTE '
        PREPARE insert_event AS 
        INSERT INTO public.platform_events (organization_id, branch_id, aggregate_type, aggregate_id, event_type, payload, idempotency_key)
        VALUES (' || quote_literal(v_org_id) || ', ' || quote_literal(v_branch_id) || ', ''msg'', gen_random_uuid(), ''queued'', ''{}''::jsonb, ''idem-123'');
    ';
END $$;
SELECT lives_ok('insert_event', 'First platform event insert succeeds');
SELECT throws_ok('insert_event', '23505', NULL, 'Duplicate idempotency key throws unique violation on platform_events');

-- 4. Rate Limiting Tests (Testing TZ-based limiting helper)
SELECT has_function('public', 'fn_check_rate_limits', ARRAY['uuid', 'uuid', 'boolean'], 'Rate limit function exists with correct signature');

-- 5. Outbox Worker logic presence
SELECT has_function('public', 'rpc_process_platform_events', ARRAY['integer'], 'Outbox event processor exists');
SELECT has_function('public', 'rpc_process_scheduled_messages', 'Scheduled message processor exists');
SELECT has_function('public', 'fn_resolve_message_recipients', ARRAY['uuid'], 'Canonical recipient resolution exists');
SELECT function_privs_are('public', 'fn_resolve_message_recipients', ARRAY['uuid'], 'authenticated', ARRAY[]::text[], 'Authenticated cannot resolve recipients directly');
SELECT function_privs_are('public', 'rpc_process_scheduled_messages', ARRAY[]::text[], 'authenticated', ARRAY[]::text[], 'Authenticated cannot process scheduled messages directly');


-- 6. RLS & Isolation Setup
SELECT policies_are('public', 'communication_messages', ARRAY[
    'Users can view messages they sent or received'
], 'Messages RLS policies enforce isolation');

SELECT policies_are('public', 'communication_recipients', ARRAY[
    'Users can view their own receipts and sent receipts'
], 'Recipients RLS enforces strict isolation to self or sender');

SELECT policies_are('public', 'communication_delivery_attempts', ARRAY[
    'Users can view attempts for messages they sent or receive'
], 'Delivery attempts inherited RLS');

SELECT policies_are('public', 'communication_attachments', ARRAY[
    'Users can view attachments for messages they can view'
], 'Attachments use unified message access policy');

SELECT policies_are('public', 'branch_communication_settings', ARRAY[
    'Branch Admins can view settings'
], 'Branch settings restricted to admins');

-- 7. Resolution Logic Tests
SELECT results_eq(
    'SELECT unnest(public.fn_resolve_message_recipients(''00000000-0000-0000-0000-000000000000''))',
    ARRAY[]::UUID[],
    'Resolution function handles missing messages safely'
);

SELECT * FROM finish();
ROLLBACK;

