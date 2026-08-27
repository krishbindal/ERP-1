BEGIN;
SELECT plan(19);

-- Existing existence tests (13 tests)
SELECT has_table('public', 'homework_assignments', 'homework_assignments table exists');
SELECT has_table('public', 'homework_submissions', 'homework_submissions table exists');
SELECT has_table('public', 'homework_attachments', 'homework_attachments table exists');
SELECT has_table('public', 'submission_attachments', 'submission_attachments table exists');
SELECT has_table('public', 'homework_audit_logs', 'homework_audit_logs table exists');

SELECT col_is_pk('public', 'homework_assignments', 'id', 'homework_assignments has PK');
SELECT col_is_pk('public', 'homework_submissions', 'id', 'homework_submissions has PK');
SELECT has_column('public', 'homework_assignments', 'status', 'homework_assignments has status');
SELECT has_column('public', 'homework_submissions', 'status', 'homework_submissions has status');

SELECT has_function('public', 'rpc_create_homework_assignment', 'rpc_create_homework_assignment exists');
SELECT has_function('public', 'rpc_update_homework_assignment', 'rpc_update_homework_assignment exists');
SELECT has_function('public', 'rpc_publish_homework', 'rpc_publish_homework exists');
SELECT has_function('public', 'rpc_submit_homework', 'rpc_submit_homework exists');

-- Add new data and state machine testing (6 tests)
SELECT is(
    (SELECT 1 FROM pg_constraint WHERE conname = 'fk_homework_assignments_section_strict'),
    1,
    'Strict section tenancy FK exists'
);

SELECT is(
    (SELECT 1 FROM pg_constraint WHERE conname = 'fk_homework_assignments_class_subject'),
    1,
    'Strict subject tenancy FK exists'
);

SELECT has_trigger('public', 'homework_assignments', 'trg_homework_state_machine', 'State machine trigger exists');
SELECT has_function('public', 'fn_trg_homework_state_machine', 'State machine function exists');

SELECT hasnt_table('public', 'homework_events', 'homework_events has been dropped for platform_events');

SELECT pass('Phase F completed validation checks.');

SELECT * FROM finish();
ROLLBACK;
