BEGIN;
SELECT plan(29);

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

-- Real Recipient Resolution Testing
DO $$
DECLARE
    v_org_id UUID;
    v_branch_id UUID;
    v_branch_id_other UUID;
    v_ay_id UUID;
    v_class_id UUID;
    v_section_id UUID;
    v_student_id UUID;
    v_student_profile_id UUID;
    v_guardian_id UUID;
    v_guardian_profile_id UUID;
    v_msg_id UUID;
    v_target_id UUID;
BEGIN
    -- Organization & Branches
    INSERT INTO public.organizations (id, name) VALUES (gen_random_uuid(), 'Test Org') RETURNING id INTO v_org_id;
    INSERT INTO public.branches (id, organization_id, name) VALUES (gen_random_uuid(), v_org_id, 'Branch 1') RETURNING id INTO v_branch_id;
    INSERT INTO public.branches (id, organization_id, name) VALUES (gen_random_uuid(), v_org_id, 'Branch 2') RETURNING id INTO v_branch_id_other;
    
    -- Academic Year
    INSERT INTO public.academic_years (id, branch_id, name, start_date, end_date, status) 
    VALUES (gen_random_uuid(), v_branch_id, 'AY 2026', '2026-01-01', '2026-12-31', 'ACTIVE') RETURNING id INTO v_ay_id;
    
    -- Class & Section
    INSERT INTO public.classes (id, branch_id, academic_year_id, name, level) VALUES (gen_random_uuid(), v_branch_id, v_ay_id, 'Class A', 1) RETURNING id INTO v_class_id;
    INSERT INTO public.sections (id, class_id, branch_id, academic_year_id, name) 
    VALUES (gen_random_uuid(), v_class_id, v_branch_id, v_ay_id, 'Section A') RETURNING id INTO v_section_id;

    -- Profiles
    INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'student@test.com') RETURNING id INTO v_student_profile_id;
    INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'guardian@test.com') RETURNING id INTO v_guardian_profile_id;
    
    INSERT INTO public.profiles (id, first_name, last_name) VALUES (v_student_profile_id, 'Stu', 'Dent');
    INSERT INTO public.profiles (id, first_name, last_name) VALUES (v_guardian_profile_id, 'Guar', 'Dian');
    
    -- Student & Guardian
    INSERT INTO public.students (id, organization_id, profile_id, first_name, last_name, gender) 
    VALUES (gen_random_uuid(), v_org_id, v_student_profile_id, 'Stu', 'Dent', 'M') RETURNING id INTO v_student_id;
    
    INSERT INTO public.guardians (id, organization_id, profile_id, first_name, last_name, status) 
    VALUES (gen_random_uuid(), v_org_id, v_guardian_profile_id, 'Guar', 'Dian', 'ACTIVE') RETURNING id INTO v_guardian_id;
    
    INSERT INTO public.student_guardians (student_id, guardian_id, relationship, is_primary) 
    VALUES (v_student_id, v_guardian_id, 'FATHER', true);
    
    -- Enrollment
    -- Requires student_branch_profile
    INSERT INTO public.student_branch_profiles (id, student_id, branch_id) VALUES (gen_random_uuid(), v_student_id, v_branch_id);
    INSERT INTO public.enrollments (id, organization_id, branch_id, student_id, student_branch_profile_id, academic_year_id, class_id, section_id, status)
    VALUES (gen_random_uuid(), v_org_id, v_branch_id, v_student_id, (SELECT id FROM public.student_branch_profiles WHERE student_id = v_student_id), v_ay_id, v_class_id, v_section_id, 'ACTIVE');

    -- Create Message
    INSERT INTO public.communication_messages (id, organization_id, branch_id, sender_id, subject, body, status, type)
    VALUES (gen_random_uuid(), v_org_id, v_branch_id, v_guardian_profile_id, 'Test', 'Test Body', 'DRAFT', 'ANNOUNCEMENT') RETURNING id INTO v_msg_id;
    
    -- Add Target
    INSERT INTO public.communication_message_targets (id, message_id, target_type, target_id)
    VALUES (gen_random_uuid(), v_msg_id, 'SECTION', v_section_id);

    -- Test A: Valid SECTION Target
    EXECUTE 'CREATE OR REPLACE VIEW test_recipients AS SELECT unnest(public.fn_resolve_message_recipients(''' || v_msg_id || ''')) AS p_id';
END $$;

SELECT results_eq(
    'SELECT count(*)::int FROM test_recipients',
    ARRAY[2],
    'Resolution correctly resolves 2 profiles (Student + Guardian) for active section target'
);

-- Concurrency / State Transition Idempotency Tests
DO $$
DECLARE
    v_msg_id UUID;
    v_org_id UUID;
    v_branch_id UUID;
    v_profile_id UUID;
BEGIN
    v_org_id := (SELECT id FROM public.organizations LIMIT 1);
    v_branch_id := (SELECT id FROM public.branches WHERE organization_id = v_org_id LIMIT 1);
    
    INSERT INTO auth.users (id, email) VALUES (gen_random_uuid(), 'admin_send@test.com') RETURNING id INTO v_profile_id;
    INSERT INTO public.profiles (id, first_name, last_name) VALUES (v_profile_id, 'A', 'S');
    INSERT INTO public.staff (id, organization_id, first_name, last_name) VALUES (gen_random_uuid(), v_org_id, 'A', 'S');
    INSERT INTO public.staff_branch_profiles (staff_id, branch_id) VALUES ((SELECT id FROM public.staff WHERE first_name = 'A'), v_branch_id);
    
    INSERT INTO public.communication_messages (id, organization_id, branch_id, sender_id, subject, body, status, type)
    VALUES (gen_random_uuid(), v_org_id, v_branch_id, v_profile_id, 'Send Test', 'Body', 'DRAFT', 'ANNOUNCEMENT') RETURNING id INTO v_msg_id;
    
    -- Become the sender to bypass RLS/auth checks
    EXECUTE 'set local role authenticated';
    EXECUTE 'set local request.jwt.claims to ''{"sub":"' || v_profile_id || '","role":"authenticated"}''';
    
    PERFORM public.rpc_send_message(v_msg_id);
    
    RESET ROLE;
    EXECUTE 'CREATE OR REPLACE VIEW test_msg_status AS SELECT status FROM public.communication_messages WHERE id = ''' || v_msg_id || '''';
END $$;
SELECT results_eq('SELECT status FROM test_msg_status', ARRAY['QUEUED'::TEXT], 'Message status transitions to QUEUED upon send');

SELECT throws_ok(
    'SELECT public.rpc_send_message((SELECT id FROM public.communication_messages WHERE subject = ''Send Test''))',
    'P0001',
    'Only DRAFT or SCHEDULED messages can be sent',
    'Concurrent or duplicate send throws exception preventing double delivery'
);

-- Service Role Grants Security Assertion
SELECT ok(has_table_privilege('service_role', 'communication_messages', 'SELECT, INSERT, UPDATE, DELETE'), 'service_role has DML on communication_messages');
SELECT ok(has_table_privilege('service_role', 'communication_recipients', 'SELECT, INSERT, UPDATE, DELETE'), 'service_role has DML on communication_recipients');
SELECT ok(has_table_privilege('service_role', 'platform_events', 'SELECT, INSERT, UPDATE, DELETE'), 'service_role has DML on platform_events');
SELECT ok(NOT has_table_privilege('service_role', 'organizations', 'DELETE'), 'service_role lacks DELETE on unrelated tables (no global grant)');

SELECT * FROM finish();
ROLLBACK;