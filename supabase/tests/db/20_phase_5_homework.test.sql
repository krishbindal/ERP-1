BEGIN;

SELECT plan(15);

-- 1. Check Tables
SELECT has_table('public', 'homework_assignments', 'homework_assignments table exists');
SELECT has_table('public', 'homework_submissions', 'homework_submissions table exists');
SELECT has_table('public', 'homework_attachments', 'homework_attachments table exists');
SELECT has_table('public', 'submission_attachments', 'submission_attachments table exists');
SELECT has_table('public', 'homework_audit_logs', 'homework_audit_logs table exists');

-- 2. Check Constraints
SELECT col_is_pk('public', 'homework_assignments', 'id', 'homework_assignments has PK');
SELECT col_is_pk('public', 'homework_submissions', 'id', 'homework_submissions has PK');
SELECT has_column('public', 'homework_assignments', 'status', 'homework_assignments has status');
SELECT has_column('public', 'homework_submissions', 'status', 'homework_submissions has status');

-- 3. Check RPCs
SELECT has_function('public', 'rpc_create_homework_assignment', 'rpc_create_homework_assignment exists');
SELECT has_function('public', 'rpc_update_homework_assignment', 'rpc_update_homework_assignment exists');
SELECT has_function('public', 'rpc_publish_homework', 'rpc_publish_homework exists');
SELECT has_function('public', 'rpc_close_homework', 'rpc_close_homework exists');
SELECT has_function('public', 'rpc_submit_homework', 'rpc_submit_homework exists');
SELECT has_function('public', 'rpc_grade_submission', 'rpc_grade_submission exists');

SELECT * FROM finish();

ROLLBACK;
