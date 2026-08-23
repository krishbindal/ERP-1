BEGIN;
SELECT plan(13);

-- 1. Check Tables and Constraints
SELECT has_table('public', 'attendance_sessions', 'attendance_sessions table exists');
SELECT has_table('public', 'attendance_records', 'attendance_records table exists');
SELECT has_table('public', 'attendance_audit_logs', 'attendance_audit_logs table exists');

SELECT col_is_pk('public', 'attendance_sessions', 'id', 'attendance_sessions has id PK');
SELECT col_is_fk('public', 'attendance_sessions', 'branch_id', 'attendance_sessions branch_id is FK');
SELECT col_is_fk('public', 'attendance_records', 'student_id', 'attendance_records student_id is FK');

-- 2. Test Enum Types
SELECT has_type('public', 'attendance_status', 'attendance_status enum exists');
SELECT has_type('public', 'attendance_action', 'attendance_action enum exists');

-- 4. Verify specific indexes
SELECT has_index('public', 'attendance_sessions', 'idx_attendance_sessions_branch_id', 'attendance_sessions branch_id index exists');
SELECT has_index('public', 'attendance_records', 'idx_attendance_records_session_id', 'attendance_records session_id index exists');

-- 5. Test RPC
SELECT has_function('public', 'rpc_auto_lock_attendance', 'rpc_auto_lock_attendance function exists');
SELECT function_returns('public', 'rpc_auto_lock_attendance', 'integer', 'rpc_auto_lock_attendance returns integer');

-- 6. Test basic constraint behavior
PREPARE insert_dup_session AS
INSERT INTO public.attendance_sessions (id, branch_id, academic_year_id, section_id, date)
VALUES 
    ('00000000-0000-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, '00000000-0000-0000-0000-000000000000'::uuid, '2026-08-01');

SELECT throws_ok(
    'insert_dup_session',
    '23503', -- foreign_key_violation
    NULL,
    'Foreign key violation prevents bad insert'
);

SELECT * FROM finish();
ROLLBACK;
