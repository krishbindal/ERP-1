BEGIN;
SELECT plan(12);

-- Setup test data
-- Assuming profiles and roles exist from previous test setups, we will do basic checks
SELECT has_table('public', 'communication_messages', 'communication_messages table exists');
SELECT has_table('public', 'platform_events', 'platform_events table exists');
SELECT has_table('public', 'communication_delivery_attempts', 'communication_delivery_attempts table exists');

SELECT has_function('public', 'rpc_create_message', 'rpc_create_message exists');
SELECT has_function('public', 'rpc_send_message', 'rpc_send_message exists');
SELECT has_function('public', 'rpc_mark_read', 'rpc_mark_read exists');
SELECT has_function('public', 'fn_is_teacher_authorized', 'fn_is_teacher_authorized exists');
SELECT has_function('public', 'fn_check_message_access', 'fn_check_message_access exists');

-- Check RLS enabled
SELECT table_privs_are('public', 'communication_messages', 'public', ARRAY[]::text[], 'Public has no access to communication_messages');
SELECT table_privs_are('public', 'platform_events', 'public', ARRAY[]::text[], 'Public has no access to platform_events');
SELECT function_privs_are('public', 'rpc_send_message', ARRAY['uuid'], 'public', ARRAY[]::text[], 'Public cannot execute rpc_send_message');
SELECT function_privs_are('public', 'rpc_create_message', ARRAY['uuid', 'uuid', 'text', 'text', 'text', 'jsonb', 'timestamp with time zone', 'timestamp with time zone'], 'public', ARRAY[]::text[], 'Public cannot execute rpc_create_message');

ROLLBACK;
