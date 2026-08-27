-- Phase C: SECURITY DEFINER Standardization

-- Standardizing public.log_audit_event
CREATE OR REPLACE FUNCTION public.log_audit_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_actor_id UUID;
    v_reason TEXT;
    v_org_id UUID;
    v_branch_id UUID;
BEGIN
    v_actor_id := auth.uid();
    
    -- Extract reason from local transaction context (set_config)
    BEGIN
        v_reason := current_setting('request.reason', true);
    EXCEPTION WHEN OTHERS THEN
        v_reason := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        BEGIN v_org_id := NEW.organization_id; EXCEPTION WHEN OTHERS THEN v_org_id := NULL; END;
        BEGIN v_branch_id := NEW.branch_id; EXCEPTION WHEN OTHERS THEN v_branch_id := NULL; END;
        INSERT INTO public.audit_logs(actor_id, organization_id, branch_id, table_name, record_id, action, new_data, reason)
        VALUES (v_actor_id, v_org_id, v_branch_id, TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), v_reason);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        BEGIN v_org_id := NEW.organization_id; EXCEPTION WHEN OTHERS THEN v_org_id := NULL; END;
        BEGIN v_branch_id := NEW.branch_id; EXCEPTION WHEN OTHERS THEN v_branch_id := NULL; END;
        INSERT INTO public.audit_logs(actor_id, organization_id, branch_id, table_name, record_id, action, old_data, new_data, reason)
        VALUES (v_actor_id, v_org_id, v_branch_id, TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), v_reason);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        BEGIN v_org_id := OLD.organization_id; EXCEPTION WHEN OTHERS THEN v_org_id := NULL; END;
        BEGIN v_branch_id := OLD.branch_id; EXCEPTION WHEN OTHERS THEN v_branch_id := NULL; END;
        INSERT INTO public.audit_logs(actor_id, organization_id, branch_id, table_name, record_id, action, old_data, reason)
        VALUES (v_actor_id, v_org_id, v_branch_id, TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), v_reason);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.log_audit_event() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_audit_event() TO authenticated, service_role;

-- Standardizing public.is_guardian_in_student_org
CREATE OR REPLACE FUNCTION public.is_guardian_in_student_org(p_student_id uuid, p_guardian_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_student_org UUID;
    v_guardian_org UUID;
BEGIN
    SELECT organization_id INTO v_student_org FROM public.students WHERE id = p_student_id;
    SELECT organization_id INTO v_guardian_org FROM public.guardians WHERE id = p_guardian_id;
    RETURN v_student_org IS NOT NULL AND v_student_org = v_guardian_org;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.is_guardian_in_student_org(p_student_id uuid, p_guardian_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_guardian_in_student_org(p_student_id uuid, p_guardian_id uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_guardian_in_student_org(p_student_id uuid, p_guardian_id uuid) TO anon;

-- Standardizing public.handle_new_branch
CREATE OR REPLACE FUNCTION public.handle_new_branch()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.branch_app_configs (branch_id, organization_id, app_name, slug)
  VALUES (NEW.id, NEW.organization_id, NEW.name, 'branch-' || NEW.id::text);
  RETURN NEW;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.handle_new_branch() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_branch() TO authenticated, service_role;

-- Standardizing public.get_branch_org
CREATE OR REPLACE FUNCTION public.get_branch_org(p_branch_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT organization_id FROM public.branches WHERE id = p_branch_id;
$function$;
REVOKE EXECUTE ON FUNCTION public.get_branch_org(p_branch_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_branch_org(p_branch_id uuid) TO authenticated, service_role;

-- Standardizing public.auth_is_super_admin_for_org
CREATE OR REPLACE FUNCTION public.auth_is_super_admin_for_org(p_organization_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_memberships om
        WHERE om.user_id = auth.uid()
          AND om.organization_id = p_organization_id
          AND om.status = 'ACTIVE'
    ) AND public.auth_is_super_admin();
$function$;
REVOKE EXECUTE ON FUNCTION public.auth_is_super_admin_for_org(p_organization_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_super_admin_for_org(p_organization_id uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_is_super_admin_for_org(p_organization_id uuid) TO anon;

-- Standardizing public.get_auth_linked_student_ids
CREATE OR REPLACE FUNCTION public.get_auth_linked_student_ids()
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT sg.student_id 
    FROM public.student_guardians sg
    JOIN public.guardians g ON sg.guardian_id = g.id
    WHERE g.profile_id = auth.uid();
$function$;
REVOKE EXECUTE ON FUNCTION public.get_auth_linked_student_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_linked_student_ids() TO authenticated, service_role;

-- Standardizing public.get_auth_linked_guardian_ids
CREATE OR REPLACE FUNCTION public.get_auth_linked_guardian_ids()
 RETURNS SETOF uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT sg.guardian_id 
    FROM public.student_guardians sg
    JOIN public.students s ON sg.student_id = s.id
    WHERE s.profile_id = auth.uid();
$function$;
REVOKE EXECUTE ON FUNCTION public.get_auth_linked_guardian_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_linked_guardian_ids() TO authenticated, service_role;

-- Standardizing public.create_student_with_initial_placement
CREATE OR REPLACE FUNCTION public.create_student_with_initial_placement(p_organization_id uuid, p_branch_id uuid, p_first_name text, p_last_name text, p_date_of_birth date DEFAULT NULL::date, p_gender text DEFAULT NULL::text, p_middle_name text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_student_id UUID;
    v_profile_id UUID;
BEGIN
    -- Explicitly validate branch membership to prevent abuse of SECURITY DEFINER
    IF NOT (public.auth_is_super_admin() OR p_branch_id = ANY(public.auth_user_branches())) THEN
        RAISE EXCEPTION 'Not authorized to create student in this branch (RLS bypassed)';
    END IF;

    -- Pre-generate the UUID to avoid RETURNING clause which triggers SELECT RLS before enrollment exists
    v_student_id := gen_random_uuid();

    -- 1. Create the student
    INSERT INTO public.students (
        id, organization_id, first_name, middle_name, last_name, date_of_birth, gender
    ) VALUES (
        v_student_id, p_organization_id, p_first_name, p_middle_name, p_last_name, p_date_of_birth, p_gender
    );
    
    -- 2. Create the branch profile
    INSERT INTO public.student_branch_profiles (
        id, student_id, branch_id
    ) VALUES (
        gen_random_uuid(), v_student_id, p_branch_id
    ) RETURNING id INTO v_profile_id;

    -- NOTE: We no longer automatically insert into enrollments here. 
    -- Callers must manually insert an enrollment with academic_year, class, and section IDs.

    RETURN v_student_id;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.create_student_with_initial_placement(p_organization_id uuid, p_branch_id uuid, p_first_name text, p_last_name text, p_date_of_birth date, p_gender text, p_middle_name text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_student_with_initial_placement(p_organization_id uuid, p_branch_id uuid, p_first_name text, p_last_name text, p_date_of_birth date, p_gender text, p_middle_name text) TO authenticated, service_role;

-- Standardizing public.rpc_transfer_student
CREATE OR REPLACE FUNCTION public.rpc_transfer_student(p_student_id uuid, p_source_branch_id uuid, p_destination_section_id uuid, p_effective_date date, p_destination_admission_number text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_dest_class_id UUID;
    v_dest_year_id UUID;
    v_dest_branch_id UUID;
    v_dest_org_id UUID;
    v_dest_branch_status TEXT;
    v_dest_year_status TEXT;
    v_source_org_id UUID;
    v_source_enrollment RECORD;
    v_source_profile RECORD;
    v_dest_profile public.student_branch_profiles%ROWTYPE;
    v_new_enrollment_id UUID;
    v_update_count INT;
BEGIN
    -- 1. Derive destination structure exclusively from section
    SELECT s.class_id, s.academic_year_id, s.branch_id, b.organization_id, b.status, ay.status
    INTO v_dest_class_id, v_dest_year_id, v_dest_branch_id, v_dest_org_id, v_dest_branch_status, v_dest_year_status
    FROM public.sections s
    JOIN public.branches b ON b.id = s.branch_id
    JOIN public.academic_years ay ON ay.id = s.academic_year_id
    WHERE s.id = p_destination_section_id;

    IF v_dest_branch_id IS NULL THEN
        RAISE EXCEPTION 'Destination section not found';
    END IF;

    IF v_dest_branch_status != 'ACTIVE' THEN
        RAISE EXCEPTION 'Destination branch is not active';
    END IF;

    IF v_dest_year_status NOT IN ('ACTIVE', 'PLANNED') THEN
        RAISE EXCEPTION 'Destination academic year is not active or planned';
    END IF;

    -- 2. Verify source branch
    SELECT organization_id INTO v_source_org_id FROM public.branches WHERE id = p_source_branch_id;
    
    IF v_source_org_id IS NULL THEN
        RAISE EXCEPTION 'Source branch not found';
    END IF;

    -- 3. Invariants
    IF v_source_org_id != v_dest_org_id THEN 
        RAISE EXCEPTION 'Source and destination branches must belong to the same organization'; 
    END IF;
    
    IF p_source_branch_id = v_dest_branch_id THEN 
        RAISE EXCEPTION 'Destination branch must be different from source branch'; 
    END IF;

    -- 4. Authorization: Super Admin OR Branch Admin in BOTH branches
    IF NOT (
        (public.auth_is_super_admin() AND EXISTS (SELECT 1 FROM public.organization_memberships WHERE user_id = auth.uid() AND organization_id = v_source_org_id AND status = 'ACTIVE')) OR
        (
            EXISTS (
                SELECT 1 FROM public.branch_memberships bm
                JOIN public.user_role_assignments ura ON ura.branch_membership_id = bm.id
                JOIN public.roles r ON r.id = ura.role_id
                WHERE bm.user_id = auth.uid() 
                  AND bm.branch_id = p_source_branch_id 
                  AND bm.status = 'ACTIVE'
                  AND r.name = 'Branch Admin'
                  AND r.organization_id = v_source_org_id
            ) AND
            EXISTS (
                SELECT 1 FROM public.branch_memberships bm
                JOIN public.user_role_assignments ura ON ura.branch_membership_id = bm.id
                JOIN public.roles r ON r.id = ura.role_id
                WHERE bm.user_id = auth.uid() 
                  AND bm.branch_id = v_dest_branch_id 
                  AND bm.status = 'ACTIVE'
                  AND r.name = 'Branch Admin'
                  AND r.organization_id = v_dest_org_id
            )
        )
    ) THEN
        RAISE EXCEPTION 'Not authorized: Must be Super Admin or Branch Admin for both branches';
    END IF;

    -- 5. Lock and Verify Active State
    PERFORM 1 FROM public.students WHERE id = p_student_id AND status = 'ACTIVE' FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Student is not active or does not exist';
    END IF;

    SELECT * INTO v_source_profile FROM public.student_branch_profiles
    WHERE student_id = p_student_id AND branch_id = p_source_branch_id AND status = 'ACTIVE'
    FOR UPDATE;

    IF v_source_profile IS NULL THEN
        RAISE EXCEPTION 'No active profile found in source branch';
    END IF;

    SELECT * INTO v_source_enrollment FROM public.enrollments 
    WHERE student_id = p_student_id AND branch_id = p_source_branch_id AND status = 'ACTIVE'
    FOR UPDATE;

    IF v_source_enrollment IS NULL THEN
        RAISE EXCEPTION 'No active enrollment found in source branch';
    END IF;

    -- 6. Date invariant
    IF p_effective_date <= v_source_enrollment.effective_from THEN
        RAISE EXCEPTION 'Effective date must be strictly after the source enrollment effective_from date';
    END IF;

    -- 7. Apply Source Transfers
    -- Enforce request reason for audit log
    PERFORM set_config('request.reason', 'Student transfer', true);

    UPDATE public.enrollments 
    SET status = 'TRANSFERRED', 
        effective_to = p_effective_date - 1 
    WHERE id = v_source_enrollment.id;

    UPDATE public.student_branch_profiles
    SET status = 'TRANSFERRED',
        updated_at = NOW()
    WHERE id = v_source_profile.id;

    -- 8. Destination Profile Handling (Reuse if exists)
    SELECT * INTO v_dest_profile FROM public.student_branch_profiles
    WHERE student_id = p_student_id AND branch_id = v_dest_branch_id
    FOR UPDATE;

    IF v_dest_profile.id IS NOT NULL THEN
        IF v_dest_profile.status = 'ACTIVE' THEN
            RAISE EXCEPTION 'Student already has an active profile in the destination branch';
        END IF;
        
        UPDATE public.student_branch_profiles 
        SET status = 'ACTIVE', 
            admission_number = COALESCE(p_destination_admission_number, admission_number) 
        WHERE id = v_dest_profile.id;
    ELSE
        INSERT INTO public.student_branch_profiles (student_id, branch_id, admission_number, status)
        VALUES (p_student_id, v_dest_branch_id, p_destination_admission_number, 'ACTIVE')
        RETURNING * INTO v_dest_profile;
    END IF;

    INSERT INTO public.enrollments (
        organization_id, 
        branch_id, 
        student_id, 
        student_branch_profile_id, 
        academic_year_id, 
        class_id, 
        section_id, 
        status, 
        effective_from
    )
    VALUES (
        v_dest_org_id, 
        v_dest_branch_id, 
        p_student_id, 
        v_dest_profile.id, 
        v_dest_year_id, 
        v_dest_class_id, 
        p_destination_section_id, 
        'ACTIVE', 
        p_effective_date
    )
    RETURNING id INTO v_new_enrollment_id;

    RETURN v_new_enrollment_id;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_transfer_student(p_student_id uuid, p_source_branch_id uuid, p_destination_section_id uuid, p_effective_date date, p_destination_admission_number text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_transfer_student(p_student_id uuid, p_source_branch_id uuid, p_destination_section_id uuid, p_effective_date date, p_destination_admission_number text) TO authenticated, service_role;

-- Standardizing public.validate_branch_timezone
CREATE OR REPLACE FUNCTION public.validate_branch_timezone()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = NEW.timezone) THEN
        RAISE EXCEPTION 'Invalid timezone: %', NEW.timezone;
    END IF;
    RETURN NEW;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.validate_branch_timezone() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_branch_timezone() TO authenticated, service_role;

-- Standardizing public.rpc_create_homework_assignment
CREATE OR REPLACE FUNCTION public.rpc_create_homework_assignment(p_branch_id uuid, p_academic_year_id uuid, p_class_id uuid, p_section_id uuid, p_subject_id uuid, p_title text, p_description text, p_issue_at timestamp with time zone, p_due_at timestamp with time zone, p_max_marks numeric)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_assignment_id UUID;
    v_author_profile_id UUID;
    v_has_permission BOOLEAN;
BEGIN
    SELECT sbp.id INTO v_author_profile_id
    FROM public.staff_branch_profiles sbp
    JOIN public.staff s ON sbp.staff_id = s.id
    WHERE s.profile_id = auth.uid() AND sbp.branch_id = p_branch_id AND sbp.status = 'ACTIVE';

    IF v_author_profile_id IS NULL THEN
        RAISE EXCEPTION 'Active staff branch profile required to create homework';
    END IF;

    v_has_permission := public.auth_user_has_branch_permission(p_branch_id, 'homework.manage.all');
    IF NOT v_has_permission THEN
        SELECT EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments
            WHERE staff_branch_profile_id = v_author_profile_id
              AND section_id = p_section_id
              AND subject_id = p_subject_id
              AND status = 'ACTIVE'
        ) INTO v_has_permission;
    END IF;

    IF NOT v_has_permission THEN
        RAISE EXCEPTION 'Unauthorized: Must be assigned teacher or have homework.manage.all';
    END IF;

    INSERT INTO public.homework_assignments (
        branch_id, academic_year_id, class_id, section_id, subject_id,
        author_profile_id, title, description, issue_at, due_at, max_marks,
        status, created_by, updated_by
    ) VALUES (
        p_branch_id, p_academic_year_id, p_class_id, p_section_id, p_subject_id,
        v_author_profile_id, p_title, p_description, p_issue_at, p_due_at, p_max_marks,
        'DRAFT', auth.uid(), auth.uid()
    ) RETURNING id INTO v_assignment_id;

    INSERT INTO public.homework_audit_logs (assignment_id, actor_id, action, new_state)
    VALUES (v_assignment_id, auth.uid(), 'CREATED', jsonb_build_object('status', 'DRAFT'));

    RETURN v_assignment_id;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_create_homework_assignment(p_branch_id uuid, p_academic_year_id uuid, p_class_id uuid, p_section_id uuid, p_subject_id uuid, p_title text, p_description text, p_issue_at timestamp with time zone, p_due_at timestamp with time zone, p_max_marks numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_create_homework_assignment(p_branch_id uuid, p_academic_year_id uuid, p_class_id uuid, p_section_id uuid, p_subject_id uuid, p_title text, p_description text, p_issue_at timestamp with time zone, p_due_at timestamp with time zone, p_max_marks numeric) TO authenticated, service_role;

-- Standardizing public.rpc_auto_lock_attendance
CREATE OR REPLACE FUNCTION public.rpc_auto_lock_attendance()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    locked_count INTEGER := 0;
BEGIN
    WITH to_lock AS (
        SELECT s.id 
        FROM public.attendance_sessions s
        JOIN public.branches b ON s.branch_id = b.id
        WHERE s.locked_at IS NULL
          AND public.timezone(b.timezone, now()) >= (s.date + interval '1 day')
        FOR UPDATE SKIP LOCKED
    )
    UPDATE public.attendance_sessions
    SET locked_at = now()
    WHERE id IN (SELECT id FROM to_lock);

    GET DIAGNOSTICS locked_count = ROW_COUNT;
    
    RETURN locked_count;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_auto_lock_attendance() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_auto_lock_attendance() TO authenticated, service_role;

-- Standardizing public.rpc_update_homework_assignment
CREATE OR REPLACE FUNCTION public.rpc_update_homework_assignment(p_id uuid, p_expected_updated_at timestamp with time zone, p_title text, p_description text, p_issue_at timestamp with time zone, p_due_at timestamp with time zone, p_max_marks numeric)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_assignment public.homework_assignments%ROWTYPE;
    v_has_permission BOOLEAN;
BEGIN
    SELECT * INTO v_assignment FROM public.homework_assignments WHERE id = p_id FOR UPDATE;
    IF v_assignment.id IS NULL THEN RAISE EXCEPTION 'Assignment not found'; END IF;
    IF v_assignment.updated_at != p_expected_updated_at THEN
        RAISE EXCEPTION 'Concurrency conflict: Assignment has been modified';
    END IF;
    IF v_assignment.status != 'DRAFT' THEN
        RAISE EXCEPTION 'Only DRAFT assignments can be modified';
    END IF;

    v_has_permission := public.auth_user_has_branch_permission(v_assignment.branch_id, 'homework.manage.all');
    IF NOT v_has_permission THEN
        SELECT EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            JOIN public.staff_branch_profiles sbp ON tsa.staff_branch_profile_id = sbp.id
            JOIN public.staff s_auth ON sbp.staff_id = s_auth.id WHERE s_auth.profile_id = auth.uid()
              AND tsa.section_id = v_assignment.section_id
              AND tsa.subject_id = v_assignment.subject_id
              AND tsa.status = 'ACTIVE'
        ) INTO v_has_permission;
    END IF;
    IF NOT v_has_permission THEN RAISE EXCEPTION 'Unauthorized'; END IF;

    UPDATE public.homework_assignments
    SET title = p_title, description = p_description, issue_at = p_issue_at, due_at = p_due_at,
        max_marks = p_max_marks, updated_at = now(), updated_by = auth.uid()
    WHERE id = p_id;

    INSERT INTO public.homework_audit_logs (assignment_id, actor_id, action)
    VALUES (p_id, auth.uid(), 'UPDATED');

    RETURN TRUE;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_update_homework_assignment(p_id uuid, p_expected_updated_at timestamp with time zone, p_title text, p_description text, p_issue_at timestamp with time zone, p_due_at timestamp with time zone, p_max_marks numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_update_homework_assignment(p_id uuid, p_expected_updated_at timestamp with time zone, p_title text, p_description text, p_issue_at timestamp with time zone, p_due_at timestamp with time zone, p_max_marks numeric) TO authenticated, service_role;

-- Standardizing public.auth_user_has_branch_permission
CREATE OR REPLACE FUNCTION public.auth_user_has_branch_permission(target_branch_id uuid, target_permission text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT public.auth_has_permission(target_branch_id, target_permission);
$function$;
REVOKE EXECUTE ON FUNCTION public.auth_user_has_branch_permission(target_branch_id uuid, target_permission text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_has_branch_permission(target_branch_id uuid, target_permission text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_user_has_branch_permission(target_branch_id uuid, target_permission text) TO anon;

-- Standardizing public.rpc_save_attendance
CREATE OR REPLACE FUNCTION public.rpc_save_attendance(p_branch_id uuid, p_academic_year_id uuid, p_section_id uuid, p_date date, p_records jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_session_id UUID;
    v_locked_at TIMESTAMPTZ;
    v_student_id UUID;
    v_status public.attendance_status;
    v_notes TEXT;
    v_record JSONB;
    v_unenrolled_count INTEGER;
BEGIN
    -- Permission Check
    IF NOT public.auth_user_has_branch_permission(p_branch_id, 'attendance.session.manage') THEN
        RAISE EXCEPTION 'Not authorized to manage attendance in this branch';
    END IF;

    -- Calendar and Academic Year bounds validation
    DECLARE
        v_operating_days INTEGER[];
        v_override_instructional BOOLEAN;
        v_is_instructional BOOLEAN;
        v_ay_start DATE;
        v_ay_end DATE;
    BEGIN
        SELECT operating_days, start_date, end_date INTO v_operating_days, v_ay_start, v_ay_end
        FROM public.academic_years
        WHERE id = p_academic_year_id AND branch_id = p_branch_id;

        IF v_operating_days IS NULL THEN
            RAISE EXCEPTION 'Academic year not found in branch';
        END IF;

        IF p_date < v_ay_start OR p_date > v_ay_end THEN
            RAISE EXCEPTION 'Date is outside academic year';
        END IF;

        SELECT is_instructional INTO v_override_instructional
        FROM public.calendar_events
        WHERE academic_year_id = p_academic_year_id
          AND p_date >= start_date AND p_date <= end_date
          AND status = 'ACTIVE'
        ORDER BY 
          is_instructional ASC,
          (end_date - start_date) ASC,
          id ASC
        LIMIT 1;

        IF v_override_instructional IS NOT NULL THEN
            v_is_instructional := v_override_instructional;
        ELSE
            v_is_instructional := EXTRACT(ISODOW FROM p_date) = ANY(v_operating_days);
        END IF;

        IF NOT v_is_instructional THEN
            RAISE EXCEPTION 'Cannot record attendance on a non-instructional day';
        END IF;
    END;


    -- Validate enrollment context for all students in the payload
    -- Block 2: student ownership/enrollment integrity
    SELECT COUNT(*)
    INTO v_unenrolled_count
    FROM jsonb_array_elements(p_records) AS r
    WHERE NOT EXISTS (
        SELECT 1 FROM public.enrollments e
        WHERE e.student_id = (r->>'student_id')::UUID
          AND e.section_id = p_section_id
          AND e.academic_year_id = p_academic_year_id
          AND e.branch_id = p_branch_id
          AND e.status = 'ACTIVE'
    );

    IF v_unenrolled_count > 0 THEN
        RAISE EXCEPTION 'One or more students are not enrolled in the specified section and branch';
    END IF;

    -- Fetch or create session
    SELECT id, locked_at INTO v_session_id, v_locked_at
    FROM public.attendance_sessions
    WHERE section_id = p_section_id AND date = p_date
    FOR UPDATE; -- lock session for concurrency

    IF v_locked_at IS NOT NULL THEN
        RAISE EXCEPTION 'Attendance is locked for this section and date';
    END IF;

    IF v_session_id IS NULL THEN
        INSERT INTO public.attendance_sessions (branch_id, academic_year_id, section_id, date)
        VALUES (p_branch_id, p_academic_year_id, p_section_id, p_date)
        RETURNING id INTO v_session_id;
    END IF;

    -- Upsert records
    FOR v_record IN SELECT * FROM jsonb_array_elements(p_records) LOOP
        v_student_id := (v_record->>'student_id')::UUID;
        v_status := (v_record->>'status')::public.attendance_status;
        v_notes := v_record->>'notes';

        INSERT INTO public.attendance_records (session_id, student_id, status, notes)
        VALUES (v_session_id, v_student_id, v_status, v_notes)
        ON CONFLICT (session_id, student_id) 
        DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = now();
    END LOOP;

    RETURN v_session_id;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_save_attendance(p_branch_id uuid, p_academic_year_id uuid, p_section_id uuid, p_date date, p_records jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_save_attendance(p_branch_id uuid, p_academic_year_id uuid, p_section_id uuid, p_date date, p_records jsonb) TO authenticated, service_role;

-- Standardizing public.auth_user_has_branch_role
CREATE OR REPLACE FUNCTION public.auth_user_has_branch_role(target_branch_id uuid, target_role_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT public.auth_has_role_slug(
        target_branch_id, 
        CASE lower(replace(target_role_name, ' ', ''))
            WHEN 'branchadmin' THEN 'branch_admin'
            WHEN 'superadmin' THEN 'super_admin'
            WHEN 'systemadmin' THEN 'system_admin'
            ELSE lower(replace(target_role_name, ' ', '_'))
        END
    );
$function$;
REVOKE EXECUTE ON FUNCTION public.auth_user_has_branch_role(target_branch_id uuid, target_role_name text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_has_branch_role(target_branch_id uuid, target_role_name text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_user_has_branch_role(target_branch_id uuid, target_role_name text) TO anon;

-- Standardizing public.fn_has_branch_permission
CREATE OR REPLACE FUNCTION public.fn_has_branch_permission(p_branch_id uuid, p_permission text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT public.auth_has_permission(p_branch_id, p_permission);
$function$;
REVOKE EXECUTE ON FUNCTION public.fn_has_branch_permission(p_branch_id uuid, p_permission text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_has_branch_permission(p_branch_id uuid, p_permission text) TO authenticated, service_role;

-- Standardizing public.auth_is_branch_admin
CREATE OR REPLACE FUNCTION public.auth_is_branch_admin(p_branch_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT public.auth_has_role_slug(p_branch_id, 'branchadmin') OR public.auth_has_role_slug(p_branch_id, 'branch_admin') OR public.auth_has_role_slug(p_branch_id, 'principal');
$function$;
REVOKE EXECUTE ON FUNCTION public.auth_is_branch_admin(p_branch_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_branch_admin(p_branch_id uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_is_branch_admin(p_branch_id uuid) TO anon;

-- Standardizing public.auth_is_active_user
CREATE OR REPLACE FUNCTION public.auth_is_active_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND status = 'ACTIVE'
    );
$function$;
REVOKE EXECUTE ON FUNCTION public.auth_is_active_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_active_user() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_is_active_user() TO anon;

-- Standardizing public.auth_is_super_admin
CREATE OR REPLACE FUNCTION public.auth_is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT public.auth_is_active_user() AND COALESCE((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_super_admin')::boolean, false);
$function$;
REVOKE EXECUTE ON FUNCTION public.auth_is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_is_super_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_is_super_admin() TO anon;

-- Standardizing public.auth_has_role_slug
CREATE OR REPLACE FUNCTION public.auth_has_role_slug(p_branch_id uuid, p_role_slug text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.branch_memberships bm
        JOIN public.branches b ON b.id = bm.branch_id
        JOIN public.organization_memberships om ON om.organization_id = b.organization_id AND om.user_id = auth.uid()
        JOIN public.user_role_assignments ura ON ura.branch_membership_id = bm.id
        JOIN public.roles r ON r.id = ura.role_id
        WHERE bm.user_id = auth.uid()
        AND bm.branch_id = p_branch_id
        AND bm.status = 'ACTIVE'
        AND b.status = 'ACTIVE'
        AND om.status = 'ACTIVE'
        AND r.slug = p_role_slug
        AND public.auth_is_active_user()
    );
$function$;
REVOKE EXECUTE ON FUNCTION public.auth_has_role_slug(p_branch_id uuid, p_role_slug text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_has_role_slug(p_branch_id uuid, p_role_slug text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_has_role_slug(p_branch_id uuid, p_role_slug text) TO anon;

-- Standardizing public.auth_has_permission
CREATE OR REPLACE FUNCTION public.auth_has_permission(p_branch_id uuid, p_permission text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.branch_memberships bm
        JOIN public.branches b ON b.id = bm.branch_id
        JOIN public.organization_memberships om ON om.organization_id = b.organization_id AND om.user_id = auth.uid()
        JOIN public.user_role_assignments ura ON ura.branch_membership_id = bm.id
        JOIN public.roles r ON r.id = ura.role_id
        JOIN public.role_permissions rp ON rp.role_id = r.id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE bm.user_id = auth.uid()
        AND bm.branch_id = p_branch_id
        AND bm.status = 'ACTIVE'
        AND b.status = 'ACTIVE'
        AND om.status = 'ACTIVE'
        AND p.name = p_permission
        AND public.auth_is_active_user()
    );
$function$;
REVOKE EXECUTE ON FUNCTION public.auth_has_permission(p_branch_id uuid, p_permission text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_has_permission(p_branch_id uuid, p_permission text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_has_permission(p_branch_id uuid, p_permission text) TO anon;

-- Standardizing public.rpc_correct_attendance
CREATE OR REPLACE FUNCTION public.rpc_correct_attendance(p_branch_id uuid, p_session_id uuid, p_student_id uuid, p_new_status attendance_status, p_reason text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_record_id UUID;
    v_old_status public.attendance_status;
    v_old_notes TEXT;
BEGIN
    IF NOT public.auth_user_has_branch_permission(p_branch_id, 'attendance.session.correct') THEN
        RAISE EXCEPTION 'Not authorized to correct attendance';
    END IF;

    IF p_reason IS NULL OR trim(p_reason) = '' THEN
        RAISE EXCEPTION 'Correction reason is mandatory';
    END IF;

    SELECT id, status, notes INTO v_record_id, v_old_status, v_old_notes
    FROM public.attendance_records
    WHERE session_id = p_session_id AND student_id = p_student_id
    FOR UPDATE;

    IF v_record_id IS NULL THEN
        RAISE EXCEPTION 'Record not found';
    END IF;

    -- Update record
    UPDATE public.attendance_records
    SET status = p_new_status, updated_at = now()
    WHERE id = v_record_id;

    -- Insert audit log atomically
    INSERT INTO public.attendance_audit_logs (
        session_id, record_id, actor_id, action, reason, before_state, after_state
    ) VALUES (
        p_session_id, v_record_id, auth.uid(), 'CORRECT', p_reason, 
        jsonb_build_object('status', v_old_status, 'notes', v_old_notes),
        jsonb_build_object('status', p_new_status, 'notes', v_old_notes)
    );

    RETURN TRUE;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_correct_attendance(p_branch_id uuid, p_session_id uuid, p_student_id uuid, p_new_status attendance_status, p_reason text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_correct_attendance(p_branch_id uuid, p_session_id uuid, p_student_id uuid, p_new_status attendance_status, p_reason text) TO authenticated, service_role;

-- Standardizing public.rpc_cleanup_expired_communications
CREATE OR REPLACE FUNCTION public.rpc_cleanup_expired_communications()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    -- Retention rule 1: Purge body for EXPIRED announcements
    UPDATE public.communication_messages
    SET body = '[PURGED]', subject = '[PURGED]', updated_at = now()
    WHERE expires_at < now() AND body != '[PURGED]';

    -- Retention rule 2: System Notifications older than 90 days
    UPDATE public.communication_messages
    SET body = '[PURGED]', subject = '[PURGED]', updated_at = now()
    WHERE type = 'SYSTEM_NOTIFICATION' AND created_at < now() - interval '90 days' AND body != '[PURGED]';

    -- Note: Asynchronous edge function handles deleting from storage buckets for purged items.
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_cleanup_expired_communications() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_cleanup_expired_communications() TO authenticated, service_role;

-- Standardizing public.rpc_publish_homework
CREATE OR REPLACE FUNCTION public.rpc_publish_homework(p_id uuid, p_expected_updated_at timestamp with time zone)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_assignment public.homework_assignments%ROWTYPE;
    v_has_permission BOOLEAN;
BEGIN
    SELECT * INTO v_assignment FROM public.homework_assignments WHERE id = p_id FOR UPDATE;
    IF v_assignment.id IS NULL THEN RAISE EXCEPTION 'Assignment not found'; END IF;
    IF v_assignment.updated_at != p_expected_updated_at THEN
        RAISE EXCEPTION 'Concurrency conflict: Assignment has been modified';
    END IF;
    IF v_assignment.status != 'DRAFT' THEN
        RAISE EXCEPTION 'Only DRAFT assignments can be published';
    END IF;

    v_has_permission := public.auth_user_has_branch_permission(v_assignment.branch_id, 'homework.manage.all');
    IF NOT v_has_permission THEN
        SELECT EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            JOIN public.staff_branch_profiles sbp ON tsa.staff_branch_profile_id = sbp.id
            JOIN public.staff s_auth ON sbp.staff_id = s_auth.id WHERE s_auth.profile_id = auth.uid()
              AND tsa.section_id = v_assignment.section_id
              AND tsa.subject_id = v_assignment.subject_id
              AND tsa.status = 'ACTIVE'
        ) INTO v_has_permission;
    END IF;
    IF NOT v_has_permission THEN RAISE EXCEPTION 'Unauthorized'; END IF;

    UPDATE public.homework_assignments
    SET status = 'PUBLISHED', updated_at = now(), updated_by = auth.uid()
    WHERE id = p_id;
    
    INSERT INTO public.homework_events (assignment_id, event_type, payload)
    VALUES (p_id, 'HOMEWORK_PUBLISHED', jsonb_build_object('assignment_id', p_id, 'status', 'PUBLISHED'));

    INSERT INTO public.homework_audit_logs (assignment_id, actor_id, action, previous_state, new_state)
    VALUES (p_id, auth.uid(), 'STATUS_CHANGED', jsonb_build_object('status', 'DRAFT'), jsonb_build_object('status', 'PUBLISHED'));

    RETURN TRUE;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_publish_homework(p_id uuid, p_expected_updated_at timestamp with time zone) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_publish_homework(p_id uuid, p_expected_updated_at timestamp with time zone) TO authenticated, service_role;

-- Standardizing public.rpc_close_homework
CREATE OR REPLACE FUNCTION public.rpc_close_homework(p_id uuid, p_expected_updated_at timestamp with time zone)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_assignment public.homework_assignments%ROWTYPE;
    v_has_permission BOOLEAN;
BEGIN
    SELECT * INTO v_assignment FROM public.homework_assignments WHERE id = p_id FOR UPDATE;
    IF v_assignment.id IS NULL THEN RAISE EXCEPTION 'Assignment not found'; END IF;
    IF v_assignment.updated_at != p_expected_updated_at THEN
        RAISE EXCEPTION 'Concurrency conflict: Assignment has been modified';
    END IF;
    IF v_assignment.status = 'CLOSED' THEN
        RAISE EXCEPTION 'Assignment is already CLOSED';
    END IF;

    v_has_permission := public.auth_user_has_branch_permission(v_assignment.branch_id, 'homework.manage.all');
    IF NOT v_has_permission THEN
        SELECT EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            JOIN public.staff_branch_profiles sbp ON tsa.staff_branch_profile_id = sbp.id
            JOIN public.staff s_auth ON sbp.staff_id = s_auth.id WHERE s_auth.profile_id = auth.uid()
              AND tsa.section_id = v_assignment.section_id
              AND tsa.subject_id = v_assignment.subject_id
              AND tsa.status = 'ACTIVE'
        ) INTO v_has_permission;
    END IF;
    IF NOT v_has_permission THEN RAISE EXCEPTION 'Unauthorized'; END IF;

    UPDATE public.homework_assignments
    SET status = 'CLOSED', updated_at = now(), updated_by = auth.uid()
    WHERE id = p_id;

    INSERT INTO public.homework_audit_logs (assignment_id, actor_id, action, previous_state, new_state)
    VALUES (p_id, auth.uid(), 'STATUS_CHANGED', jsonb_build_object('status', v_assignment.status), jsonb_build_object('status', 'CLOSED'));

    RETURN TRUE;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_close_homework(p_id uuid, p_expected_updated_at timestamp with time zone) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_close_homework(p_id uuid, p_expected_updated_at timestamp with time zone) TO authenticated, service_role;

-- Standardizing public.rpc_submit_homework
CREATE OR REPLACE FUNCTION public.rpc_submit_homework(p_assignment_id uuid, p_expected_version integer, p_comment text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_assignment public.homework_assignments%ROWTYPE;
    v_student_id UUID;
    v_submission public.homework_submissions%ROWTYPE;
    v_submission_id UUID;
    v_is_enrolled BOOLEAN;
BEGIN
    SELECT * INTO v_assignment FROM public.homework_assignments WHERE id = p_assignment_id FOR SHARE;
    IF v_assignment.id IS NULL THEN RAISE EXCEPTION 'Assignment not found'; END IF;
    IF v_assignment.status != 'PUBLISHED' THEN
        RAISE EXCEPTION 'Cannot submit to an assignment that is not PUBLISHED';
    END IF;

    SELECT id INTO v_student_id FROM public.students WHERE profile_id = auth.uid() AND status = 'ACTIVE' LIMIT 1;
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Active student profile not found for user';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE student_id = v_student_id
          AND section_id = v_assignment.section_id
          AND academic_year_id = v_assignment.academic_year_id
          AND status = 'ENROLLED'
    ) INTO v_is_enrolled;
    IF NOT v_is_enrolled THEN RAISE EXCEPTION 'Student is not enrolled in this section'; END IF;

    SELECT * INTO v_submission FROM public.homework_submissions 
    WHERE assignment_id = p_assignment_id AND student_id = v_student_id FOR UPDATE;

    IF v_submission.id IS NULL THEN
        IF p_expected_version != 0 THEN
            RAISE EXCEPTION 'Concurrency conflict: Submission already exists or version mismatch';
        END IF;

        INSERT INTO public.homework_submissions (
            assignment_id, student_id, status, submitted_at, student_comment, version
        ) VALUES (
            p_assignment_id, v_student_id, 'SUBMITTED', now(), p_comment, 1
        ) RETURNING id INTO v_submission_id;

        INSERT INTO public.homework_audit_logs (submission_id, actor_id, action, new_state)
        VALUES (v_submission_id, auth.uid(), 'SUBMITTED', jsonb_build_object('status', 'SUBMITTED'));

    ELSE
        IF v_submission.version != p_expected_version THEN
            RAISE EXCEPTION 'Concurrency conflict: Submission has been modified';
        END IF;
        IF v_submission.status NOT IN ('PENDING', 'RETURNED') THEN
            RAISE EXCEPTION 'Cannot submit a submission currently in state %', v_submission.status;
        END IF;

        UPDATE public.homework_submissions
        SET status = 'SUBMITTED', submitted_at = now(), student_comment = p_comment,
            version = version + 1, updated_at = now()
        WHERE id = v_submission.id
        RETURNING id INTO v_submission_id;

        INSERT INTO public.homework_audit_logs (submission_id, actor_id, action, previous_state, new_state)
        VALUES (v_submission_id, auth.uid(), 'SUBMITTED', jsonb_build_object('status', v_submission.status), jsonb_build_object('status', 'SUBMITTED'));
    END IF;

    RETURN v_submission_id;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_submit_homework(p_assignment_id uuid, p_expected_version integer, p_comment text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_submit_homework(p_assignment_id uuid, p_expected_version integer, p_comment text) TO authenticated, service_role;

-- Standardizing public.rpc_grade_submission
CREATE OR REPLACE FUNCTION public.rpc_grade_submission(p_submission_id uuid, p_expected_version integer, p_marks numeric, p_feedback text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_submission public.homework_submissions%ROWTYPE;
    v_assignment public.homework_assignments%ROWTYPE;
    v_has_permission BOOLEAN;
    v_grader_profile_id UUID;
BEGIN
    SELECT * INTO v_submission FROM public.homework_submissions WHERE id = p_submission_id FOR UPDATE;
    IF v_submission.id IS NULL THEN RAISE EXCEPTION 'Submission not found'; END IF;
    IF v_submission.version != p_expected_version THEN
        RAISE EXCEPTION 'Concurrency conflict: Submission has been modified';
    END IF;

    SELECT * INTO v_assignment FROM public.homework_assignments WHERE id = v_submission.assignment_id;

    SELECT sbp.id INTO v_grader_profile_id FROM public.staff_branch_profiles sbp
    JOIN public.staff s ON sbp.staff_id = s.id
    WHERE s.profile_id = auth.uid() AND sbp.branch_id = v_assignment.branch_id AND sbp.status = 'ACTIVE';

    v_has_permission := public.auth_user_has_branch_permission(v_assignment.branch_id, 'homework.manage.all');
    IF NOT v_has_permission THEN
        SELECT EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            WHERE tsa.staff_branch_profile_id = v_grader_profile_id
              AND tsa.section_id = v_assignment.section_id
              AND tsa.subject_id = v_assignment.subject_id
              AND tsa.status = 'ACTIVE'
        ) INTO v_has_permission;
    END IF;
    IF NOT v_has_permission THEN RAISE EXCEPTION 'Unauthorized'; END IF;

    UPDATE public.homework_submissions
    SET status = 'GRADED', marks_awarded = p_marks, teacher_feedback = p_feedback,
        graded_at = now(), graded_by_profile_id = v_grader_profile_id,
        version = version + 1, updated_at = now()
    WHERE id = p_submission_id;

    INSERT INTO public.homework_audit_logs (submission_id, actor_id, action, previous_state, new_state)
    VALUES (p_submission_id, auth.uid(), 'GRADED', jsonb_build_object('status', v_submission.status), jsonb_build_object('status', 'GRADED', 'marks_awarded', p_marks));

    RETURN TRUE;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_grade_submission(p_submission_id uuid, p_expected_version integer, p_marks numeric, p_feedback text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_grade_submission(p_submission_id uuid, p_expected_version integer, p_marks numeric, p_feedback text) TO authenticated, service_role;

-- Standardizing public.rpc_return_submission
CREATE OR REPLACE FUNCTION public.rpc_return_submission(p_submission_id uuid, p_expected_version integer, p_feedback text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_submission public.homework_submissions%ROWTYPE;
    v_assignment public.homework_assignments%ROWTYPE;
    v_has_permission BOOLEAN;
    v_grader_profile_id UUID;
BEGIN
    SELECT * INTO v_submission FROM public.homework_submissions WHERE id = p_submission_id FOR UPDATE;
    IF v_submission.id IS NULL THEN RAISE EXCEPTION 'Submission not found'; END IF;
    IF v_submission.version != p_expected_version THEN
        RAISE EXCEPTION 'Concurrency conflict: Submission has been modified';
    END IF;

    SELECT * INTO v_assignment FROM public.homework_assignments WHERE id = v_submission.assignment_id;

    SELECT sbp.id INTO v_grader_profile_id FROM public.staff_branch_profiles sbp
    JOIN public.staff s ON sbp.staff_id = s.id
    WHERE s.profile_id = auth.uid() AND sbp.branch_id = v_assignment.branch_id AND sbp.status = 'ACTIVE';

    v_has_permission := public.auth_user_has_branch_permission(v_assignment.branch_id, 'homework.manage.all');
    IF NOT v_has_permission THEN
        SELECT EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            WHERE tsa.staff_branch_profile_id = v_grader_profile_id
              AND tsa.section_id = v_assignment.section_id
              AND tsa.subject_id = v_assignment.subject_id
              AND tsa.status = 'ACTIVE'
        ) INTO v_has_permission;
    END IF;
    IF NOT v_has_permission THEN RAISE EXCEPTION 'Unauthorized'; END IF;

    UPDATE public.homework_submissions
    SET status = 'RETURNED', teacher_feedback = p_feedback,
        version = version + 1, updated_at = now()
    WHERE id = p_submission_id;

    INSERT INTO public.homework_audit_logs (submission_id, actor_id, action, previous_state, new_state)
    VALUES (p_submission_id, auth.uid(), 'RETURNED', jsonb_build_object('status', v_submission.status), jsonb_build_object('status', 'RETURNED'));

    RETURN TRUE;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_return_submission(p_submission_id uuid, p_expected_version integer, p_feedback text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_return_submission(p_submission_id uuid, p_expected_version integer, p_feedback text) TO authenticated, service_role;

-- Standardizing public.auth_can_access_homework_file
CREATE OR REPLACE FUNCTION public.auth_can_access_homework_file(p_bucket_id text, p_object_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_parts text[];
    v_branch_id UUID;
    v_ay_id UUID;
    v_type text;
    v_entity_id UUID;
    v_assignment public.homework_assignments%ROWTYPE;
    v_submission public.homework_submissions%ROWTYPE;
    v_is_authorized BOOLEAN := FALSE;
    v_student_id UUID;
BEGIN
    IF p_bucket_id != 'homework_assets' THEN RETURN FALSE; END IF;

    v_parts := string_to_array(p_object_name, '/');
    IF array_length(v_parts, 1) < 5 THEN RETURN FALSE; END IF;

    BEGIN
        v_branch_id := v_parts[1]::UUID;
        v_ay_id := v_parts[2]::UUID;
        v_type := v_parts[3];
        v_entity_id := v_parts[4]::UUID;
    EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
    END;

    IF v_type = 'assignments' THEN
        SELECT * INTO v_assignment FROM public.homework_assignments WHERE id = v_entity_id AND branch_id = v_branch_id AND academic_year_id = v_ay_id;
        IF v_assignment.id IS NULL THEN RETURN FALSE; END IF;

        IF public.auth_user_has_branch_permission(v_branch_id, 'homework.manage.all') THEN RETURN TRUE; END IF;
        
        SELECT EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            JOIN public.staff_branch_profiles sbp ON tsa.staff_branch_profile_id = sbp.id
            JOIN public.staff s_auth ON sbp.staff_id = s_auth.id WHERE s_auth.profile_id = auth.uid() AND tsa.section_id = v_assignment.section_id AND tsa.subject_id = v_assignment.subject_id AND tsa.status = 'ACTIVE'
        ) INTO v_is_authorized;
        IF v_is_authorized THEN RETURN TRUE; END IF;

        IF v_assignment.status IN ('PUBLISHED', 'CLOSED') THEN
            SELECT EXISTS (
                SELECT 1 FROM public.enrollments e
                JOIN public.students s ON e.student_id = s.id
                WHERE s.profile_id = auth.uid() AND e.section_id = v_assignment.section_id AND e.academic_year_id = v_assignment.academic_year_id AND e.status = 'ENROLLED'
            ) INTO v_is_authorized;
            IF v_is_authorized THEN RETURN TRUE; END IF;

            SELECT EXISTS (
                SELECT 1 FROM public.student_guardians sg
                JOIN public.guardians g ON sg.guardian_id = g.id
                JOIN public.enrollments e ON sg.student_id = e.student_id
                WHERE g.profile_id = auth.uid() AND e.section_id = v_assignment.section_id AND e.academic_year_id = v_assignment.academic_year_id AND e.status = 'ENROLLED'
            ) INTO v_is_authorized;
            IF v_is_authorized THEN RETURN TRUE; END IF;
        END IF;

    ELSIF v_type = 'submissions' THEN
        SELECT * INTO v_submission FROM public.homework_submissions WHERE id = v_entity_id;
        IF v_submission.id IS NULL THEN RETURN FALSE; END IF;

        SELECT * INTO v_assignment FROM public.homework_assignments WHERE id = v_submission.assignment_id AND branch_id = v_branch_id AND academic_year_id = v_ay_id;
        IF v_assignment.id IS NULL THEN RETURN FALSE; END IF;

        IF public.auth_user_has_branch_permission(v_branch_id, 'homework.manage.all') THEN RETURN TRUE; END IF;
        
        SELECT EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            JOIN public.staff_branch_profiles sbp ON tsa.staff_branch_profile_id = sbp.id
            JOIN public.staff s_auth ON sbp.staff_id = s_auth.id WHERE s_auth.profile_id = auth.uid() AND tsa.section_id = v_assignment.section_id AND tsa.subject_id = v_assignment.subject_id AND tsa.status = 'ACTIVE'
        ) INTO v_is_authorized;
        IF v_is_authorized THEN RETURN TRUE; END IF;

        SELECT id INTO v_student_id FROM public.students WHERE profile_id = auth.uid() AND status = 'ACTIVE';
        IF v_student_id = v_submission.student_id THEN RETURN TRUE; END IF;

        SELECT EXISTS (
            SELECT 1 FROM public.student_guardians sg
            JOIN public.guardians g ON sg.guardian_id = g.id
            WHERE g.profile_id = auth.uid() AND sg.student_id = v_submission.student_id
        ) INTO v_is_authorized;
        IF v_is_authorized THEN RETURN TRUE; END IF;
    END IF;

    RETURN FALSE;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.auth_can_access_homework_file(p_bucket_id text, p_object_name text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_can_access_homework_file(p_bucket_id text, p_object_name text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_can_access_homework_file(p_bucket_id text, p_object_name text) TO anon;

-- Standardizing public.auth_can_upload_homework_file
CREATE OR REPLACE FUNCTION public.auth_can_upload_homework_file(p_bucket_id text, p_object_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_parts text[];
    v_branch_id UUID;
    v_ay_id UUID;
    v_type text;
    v_entity_id UUID;
    v_assignment public.homework_assignments%ROWTYPE;
    v_submission public.homework_submissions%ROWTYPE;
    v_is_authorized BOOLEAN := FALSE;
    v_student_id UUID;
BEGIN
    IF p_bucket_id != 'homework_assets' THEN RETURN FALSE; END IF;
    v_parts := string_to_array(p_object_name, '/');
    IF array_length(v_parts, 1) < 5 THEN RETURN FALSE; END IF;

    BEGIN
        v_branch_id := v_parts[1]::UUID;
        v_ay_id := v_parts[2]::UUID;
        v_type := v_parts[3];
        v_entity_id := v_parts[4]::UUID;
    EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
    END;

    IF v_type = 'assignments' THEN
        SELECT * INTO v_assignment FROM public.homework_assignments WHERE id = v_entity_id AND branch_id = v_branch_id AND academic_year_id = v_ay_id;
        IF v_assignment.id IS NULL THEN RETURN FALSE; END IF;

        IF public.auth_user_has_branch_permission(v_branch_id, 'homework.manage.all') THEN RETURN TRUE; END IF;
        
        SELECT EXISTS (
            SELECT 1 FROM public.teacher_subject_assignments tsa
            JOIN public.staff_branch_profiles sbp ON tsa.staff_branch_profile_id = sbp.id
            JOIN public.staff s_auth ON sbp.staff_id = s_auth.id WHERE s_auth.profile_id = auth.uid() AND tsa.section_id = v_assignment.section_id AND tsa.subject_id = v_assignment.subject_id AND tsa.status = 'ACTIVE'
        ) INTO v_is_authorized;
        IF v_is_authorized THEN RETURN TRUE; END IF;

    ELSIF v_type = 'submissions' THEN
        SELECT * INTO v_submission FROM public.homework_submissions WHERE id = v_entity_id;
        IF v_submission.id IS NULL THEN RETURN FALSE; END IF;

        SELECT * INTO v_assignment FROM public.homework_assignments WHERE id = v_submission.assignment_id AND branch_id = v_branch_id AND academic_year_id = v_ay_id;
        IF v_assignment.id IS NULL THEN RETURN FALSE; END IF;

        IF v_assignment.status != 'PUBLISHED' THEN RETURN FALSE; END IF;

        SELECT id INTO v_student_id FROM public.students WHERE profile_id = auth.uid() AND status = 'ACTIVE';
        IF v_student_id = v_submission.student_id THEN RETURN TRUE; END IF;
    END IF;

    RETURN FALSE;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.auth_can_upload_homework_file(p_bucket_id text, p_object_name text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_can_upload_homework_file(p_bucket_id text, p_object_name text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_can_upload_homework_file(p_bucket_id text, p_object_name text) TO anon;

-- Standardizing public.fn_is_teacher_authorized
CREATE OR REPLACE FUNCTION public.fn_is_teacher_authorized(p_section_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.staff s
        JOIN public.staff_branch_profiles sbp ON sbp.staff_id = s.id
        JOIN public.teacher_subject_assignments tsa ON tsa.staff_branch_profile_id = sbp.id
        JOIN public.academic_years ay ON ay.id = tsa.academic_year_id
        WHERE s.profile_id = auth.uid()
        AND tsa.section_id = p_section_id
        AND ay.status IN ('PLANNED', 'ACTIVE')
        AND s.status = 'ACTIVE'
        AND sbp.status = 'ACTIVE'
        AND tsa.status = 'ACTIVE'
    );
$function$;
REVOKE EXECUTE ON FUNCTION public.fn_is_teacher_authorized(p_section_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_is_teacher_authorized(p_section_id uuid) TO authenticated, service_role;

-- Standardizing public.fn_is_teacher_authorized_class
CREATE OR REPLACE FUNCTION public.fn_is_teacher_authorized_class(p_class_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.staff s
        JOIN public.staff_branch_profiles sbp ON sbp.staff_id = s.id
        JOIN public.teacher_subject_assignments tsa ON tsa.staff_branch_profile_id = sbp.id
        JOIN public.academic_years ay ON ay.id = tsa.academic_year_id
        WHERE s.profile_id = auth.uid()
        AND tsa.class_id = p_class_id
        AND ay.status IN ('PLANNED', 'ACTIVE')
        AND s.status = 'ACTIVE'
        AND sbp.status = 'ACTIVE'
        AND tsa.status = 'ACTIVE'
    );
$function$;
REVOKE EXECUTE ON FUNCTION public.fn_is_teacher_authorized_class(p_class_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_is_teacher_authorized_class(p_class_id uuid) TO authenticated, service_role;

-- Standardizing public.fn_is_message_sender_or_admin
CREATE OR REPLACE FUNCTION public.fn_is_message_sender_or_admin(p_message_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.communication_messages cm
        WHERE cm.id = p_message_id
        AND (
            cm.sender_id = auth.uid() OR
            public.fn_has_branch_permission(cm.branch_id, 'communication.manage.branch')
        )
    );
$function$;
REVOKE EXECUTE ON FUNCTION public.fn_is_message_sender_or_admin(p_message_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_is_message_sender_or_admin(p_message_id uuid) TO authenticated, service_role;

-- Standardizing public.fn_is_message_recipient
CREATE OR REPLACE FUNCTION public.fn_is_message_recipient(p_message_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.communication_recipients
        WHERE message_id = p_message_id AND recipient_id = auth.uid()
    );
$function$;
REVOKE EXECUTE ON FUNCTION public.fn_is_message_recipient(p_message_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_is_message_recipient(p_message_id uuid) TO authenticated, service_role;

-- Standardizing public.fn_check_rate_limits
CREATE OR REPLACE FUNCTION public.fn_check_rate_limits(p_branch_id uuid, p_sender_id uuid, p_is_admin boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_today_count INT;
    v_limit INT;
    v_tz TEXT;
BEGIN
    SELECT timezone INTO v_tz FROM public.branch_communication_settings WHERE branch_id = p_branch_id;
    IF v_tz IS NULL THEN v_tz := 'UTC'; END IF;

    IF p_is_admin THEN
        SELECT max_admin_announcements_per_day INTO v_limit FROM public.branch_communication_settings WHERE branch_id = p_branch_id;
        IF v_limit IS NULL THEN v_limit := 50; END IF;
    ELSE
        SELECT max_teacher_announcements_per_day INTO v_limit FROM public.branch_communication_settings WHERE branch_id = p_branch_id;
        IF v_limit IS NULL THEN v_limit := 5; END IF;
    END IF;

    SELECT COUNT(*) INTO v_today_count FROM public.communication_messages 
    WHERE sender_id = p_sender_id 
    AND (created_at AT TIME ZONE 'UTC' AT TIME ZONE v_tz)::date = (now() AT TIME ZONE 'UTC' AT TIME ZONE v_tz)::date;

    IF v_today_count >= v_limit THEN
        RAISE EXCEPTION 'Rate limit exceeded: You have sent % messages today. Limit is %.', v_today_count, v_limit;
    END IF;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.fn_check_rate_limits(p_branch_id uuid, p_sender_id uuid, p_is_admin boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_check_rate_limits(p_branch_id uuid, p_sender_id uuid, p_is_admin boolean) TO authenticated, service_role;

-- Standardizing public.fn_trg_roles_generate_slug
CREATE OR REPLACE FUNCTION public.fn_trg_roles_generate_slug()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug := lower(replace(NEW.name, ' ', '_'));
    END IF;
    RETURN NEW;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.fn_trg_roles_generate_slug() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_trg_roles_generate_slug() TO authenticated, service_role;

-- Standardizing public.auth_user_organizations
CREATE OR REPLACE FUNCTION public.auth_user_organizations()
 RETURNS uuid[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT array_agg(organization_id)
    FROM public.organization_memberships
    WHERE user_id = auth.uid() AND status = 'ACTIVE';
$function$;
REVOKE EXECUTE ON FUNCTION public.auth_user_organizations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_organizations() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_user_organizations() TO anon;

-- Standardizing public.auth_user_branches
CREATE OR REPLACE FUNCTION public.auth_user_branches()
 RETURNS uuid[]
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT array_agg(branch_id)
    FROM public.branch_memberships
    WHERE user_id = auth.uid() AND status = 'ACTIVE';
$function$;
REVOKE EXECUTE ON FUNCTION public.auth_user_branches() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_user_branches() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_user_branches() TO anon;

-- Standardizing public.rpc_create_message
CREATE OR REPLACE FUNCTION public.rpc_create_message(p_branch_id uuid, p_subject text, p_body text, p_type text, p_targets jsonb, p_scheduled_for timestamp with time zone, p_expires_at timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_message_id UUID;
    v_target JSONB;
    v_target_type TEXT;
    v_target_id UUID;
    v_has_branch_manage BOOLEAN;
    v_org_id UUID;
    v_is_active BOOLEAN;
BEGIN
    SELECT (status = 'ACTIVE') INTO v_is_active FROM public.profiles WHERE id = auth.uid();
    IF v_is_active IS NOT TRUE THEN RAISE EXCEPTION 'User profile is inactive'; END IF;

    SELECT organization_id INTO v_org_id FROM public.branches WHERE id = p_branch_id;
    IF v_org_id IS NULL THEN RAISE EXCEPTION 'Invalid branch'; END IF;

    IF NOT EXISTS (SELECT 1 FROM public.branch_memberships WHERE branch_id = p_branch_id AND user_id = auth.uid() AND status = 'ACTIVE') THEN
        RAISE EXCEPTION 'Not an active member of this branch';
    END IF;

    v_has_branch_manage := public.fn_has_branch_permission(p_branch_id, 'communication.manage.branch');
    PERFORM public.fn_check_rate_limits(p_branch_id, auth.uid(), v_has_branch_manage);

    FOR v_target IN SELECT * FROM jsonb_array_elements(p_targets)
    LOOP
        v_target_type := v_target->>'target_type';
        v_target_id := (v_target->>'target_id')::UUID;
        
        IF v_target_type = 'BRANCH' AND NOT v_has_branch_manage THEN RAISE EXCEPTION 'Unauthorized to target branch-wide'; END IF;
        IF v_target_type = 'CLASS' AND NOT v_has_branch_manage AND NOT public.fn_is_teacher_authorized_class(v_target_id) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
        IF v_target_type = 'SECTION' AND NOT v_has_branch_manage AND NOT public.fn_is_teacher_authorized(v_target_id) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
    END LOOP;

    INSERT INTO public.communication_messages (
        organization_id, branch_id, sender_id, subject, body, type, scheduled_for, expires_at, status
    ) VALUES (
        v_org_id, p_branch_id, auth.uid(), p_subject, p_body, p_type, p_scheduled_for, p_expires_at, 
        CASE WHEN p_scheduled_for IS NOT NULL THEN 'SCHEDULED' ELSE 'DRAFT' END
    ) RETURNING id INTO v_message_id;

    FOR v_target IN SELECT * FROM jsonb_array_elements(p_targets)
    LOOP
        v_target_type := v_target->>'target_type';
        v_target_id := (v_target->>'target_id')::UUID;
        IF v_target_type = 'BRANCH' THEN v_target_id := NULL; END IF;
        IF v_target_type IN ('CLASS', 'SECTION') AND v_target_id IS NULL THEN RAISE EXCEPTION 'Target ID required'; END IF;
        INSERT INTO public.communication_message_targets (message_id, target_type, target_id) VALUES (v_message_id, v_target_type, v_target_id);
    END LOOP;

    INSERT INTO public.communication_audit_logs (message_id, actor_id, action, metadata) VALUES (v_message_id, auth.uid(), 'CREATED', jsonb_build_object('type', p_type));

    RETURN v_message_id;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_create_message(p_branch_id uuid, p_subject text, p_body text, p_type text, p_targets jsonb, p_scheduled_for timestamp with time zone, p_expires_at timestamp with time zone) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_create_message(p_branch_id uuid, p_subject text, p_body text, p_type text, p_targets jsonb, p_scheduled_for timestamp with time zone, p_expires_at timestamp with time zone) TO authenticated, service_role;

-- Standardizing public.fn_resolve_message_recipients
CREATE OR REPLACE FUNCTION public.fn_resolve_message_recipients(p_message_id uuid)
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_target RECORD;
    v_recipients UUID[] := ARRAY[]::UUID[];
BEGIN
    FOR v_target IN SELECT * FROM public.communication_message_targets WHERE message_id = p_message_id
    LOOP
        IF v_target.target_type = 'SECTION' THEN
            SELECT array_cat(v_recipients, array_agg(DISTINCT st.profile_id)) INTO v_recipients FROM public.enrollments e JOIN public.students st ON st.id = e.student_id WHERE e.section_id = v_target.target_id AND e.status = 'ACTIVE' AND st.profile_id IS NOT NULL AND st.status = 'ACTIVE';
            SELECT array_cat(v_recipients, array_agg(DISTINCT g.profile_id)) INTO v_recipients FROM public.enrollments e JOIN public.student_guardians sg ON sg.student_id = e.student_id JOIN public.guardians g ON g.id = sg.guardian_id WHERE e.section_id = v_target.target_id AND e.status = 'ACTIVE' AND g.profile_id IS NOT NULL AND g.status = 'ACTIVE';
        ELSIF v_target.target_type = 'CLASS' THEN
            SELECT array_cat(v_recipients, array_agg(DISTINCT st.profile_id)) INTO v_recipients FROM public.enrollments e JOIN public.students st ON st.id = e.student_id WHERE e.class_id = v_target.target_id AND e.status = 'ACTIVE' AND st.profile_id IS NOT NULL AND st.status = 'ACTIVE';
            SELECT array_cat(v_recipients, array_agg(DISTINCT g.profile_id)) INTO v_recipients FROM public.enrollments e JOIN public.student_guardians sg ON sg.student_id = e.student_id JOIN public.guardians g ON g.id = sg.guardian_id WHERE e.class_id = v_target.target_id AND e.status = 'ACTIVE' AND g.profile_id IS NOT NULL AND g.status = 'ACTIVE';
        ELSIF v_target.target_type = 'BRANCH' THEN
            SELECT array_cat(v_recipients, array_agg(DISTINCT s.profile_id)) INTO v_recipients FROM public.staff_branch_profiles sbp JOIN public.staff s ON s.id = sbp.staff_id WHERE sbp.branch_id = (SELECT branch_id FROM public.communication_messages WHERE id = p_message_id) AND sbp.status = 'ACTIVE' AND s.status = 'ACTIVE' AND s.profile_id IS NOT NULL;
            SELECT array_cat(v_recipients, array_agg(DISTINCT st.profile_id)) INTO v_recipients FROM public.student_branch_profiles stbp JOIN public.students st ON st.id = stbp.student_id WHERE stbp.branch_id = (SELECT branch_id FROM public.communication_messages WHERE id = p_message_id) AND stbp.status = 'ACTIVE' AND st.status = 'ACTIVE' AND st.profile_id IS NOT NULL;
            SELECT array_cat(v_recipients, array_agg(DISTINCT g.profile_id)) INTO v_recipients FROM public.student_branch_profiles stbp JOIN public.students st ON st.id = stbp.student_id JOIN public.student_guardians sg ON sg.student_id = st.id JOIN public.guardians g ON g.id = sg.guardian_id WHERE stbp.branch_id = (SELECT branch_id FROM public.communication_messages WHERE id = p_message_id) AND stbp.status = 'ACTIVE' AND st.status = 'ACTIVE' AND g.status = 'ACTIVE' AND g.profile_id IS NOT NULL;
        END IF;
    END LOOP;
    RETURN (SELECT array_agg(DISTINCT val) FROM unnest(v_recipients) as val);
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.fn_resolve_message_recipients(p_message_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_resolve_message_recipients(p_message_id uuid) TO authenticated, service_role;

-- Standardizing public.rpc_process_platform_events
CREATE OR REPLACE FUNCTION public.rpc_process_platform_events(p_batch_size integer DEFAULT 50)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_evt RECORD;
    v_recipients UUID[];
    v_rec UUID;
BEGIN
    FOR v_evt IN 
        SELECT * FROM public.platform_events 
        WHERE status = 'PENDING' AND next_retry_at <= now()
        ORDER BY created_at ASC LIMIT p_batch_size 
        FOR UPDATE SKIP LOCKED
    LOOP
        BEGIN
            UPDATE public.platform_events SET status = 'PROCESSING', attempts = attempts + 1 WHERE id = v_evt.id;

            IF v_evt.event_type = 'message.queued' AND v_evt.aggregate_type = 'communication_message' THEN
                v_recipients := public.fn_resolve_message_recipients(v_evt.aggregate_id);
                FOREACH v_rec IN ARRAY v_recipients
                LOOP
                    INSERT INTO public.communication_recipients (message_id, recipient_id, status) VALUES (v_evt.aggregate_id, v_rec, 'SENT') ON CONFLICT DO NOTHING;
                    INSERT INTO public.communication_delivery_attempts (recipient_id, channel, provider, attempt_number, success_delivery_timestamp)
                    SELECT cr.id, 'IN_APP', 'INTERNAL', 1, now() FROM public.communication_recipients cr WHERE cr.message_id = v_evt.aggregate_id AND cr.recipient_id = v_rec;
                END LOOP;
                UPDATE public.communication_messages SET status = 'SENT', updated_at = now() WHERE id = v_evt.aggregate_id;
                INSERT INTO public.communication_audit_logs (message_id, action, metadata) VALUES (v_evt.aggregate_id, 'PROCESSED_DISPATCH', jsonb_build_object('recipient_count', array_length(v_recipients, 1)));
            END IF;

            UPDATE public.platform_events SET status = 'COMPLETED', processed_at = now() WHERE id = v_evt.id;
        EXCEPTION WHEN OTHERS THEN
            IF v_evt.attempts >= v_evt.max_attempts THEN
                UPDATE public.platform_events SET status = 'DLQ', error_details = jsonb_build_object('error', SQLERRM) WHERE id = v_evt.id;
                INSERT INTO public.dead_letter_queue (organization_id, branch_id, source_table, source_id, payload, error_details, attempts, first_failed_at, last_failed_at)
                VALUES (v_evt.organization_id, v_evt.branch_id, 'platform_events', v_evt.id, v_evt.payload, jsonb_build_object('error', SQLERRM), v_evt.attempts, now(), now());
                IF v_evt.event_type = 'message.queued' THEN UPDATE public.communication_messages SET status = 'FAILED' WHERE id = v_evt.aggregate_id; END IF;
            ELSE
                UPDATE public.platform_events SET status = 'PENDING', next_retry_at = now() + (power(2, v_evt.attempts) * interval '1 minute'), error_details = jsonb_build_object('error', SQLERRM) WHERE id = v_evt.id;
            END IF;
        END;
    END LOOP;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_process_platform_events(p_batch_size integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_process_platform_events(p_batch_size integer) TO authenticated, service_role;

-- Standardizing public.fn_check_message_access
CREATE OR REPLACE FUNCTION public.fn_check_message_access(p_message_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    SELECT EXISTS (SELECT 1 FROM public.communication_messages WHERE id = p_message_id AND (sender_id = auth.uid() OR public.fn_has_branch_permission(branch_id, 'communication.manage.branch')))
    OR EXISTS (SELECT 1 FROM public.communication_recipients WHERE message_id = p_message_id AND recipient_id = auth.uid());
$function$;
REVOKE EXECUTE ON FUNCTION public.fn_check_message_access(p_message_id uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_check_message_access(p_message_id uuid) TO authenticated, service_role;

-- Standardizing public.fn_bridge_homework_events
CREATE OR REPLACE FUNCTION public.fn_bridge_homework_events()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_org_id UUID;
    v_branch_id UUID;
BEGIN
    SELECT organization_id, branch_id INTO v_org_id, v_branch_id
    FROM public.homework_assignments WHERE id = NEW.assignment_id;

    INSERT INTO public.platform_events (
        organization_id, branch_id, aggregate_type, aggregate_id, event_type, payload, idempotency_key
    ) VALUES (
        v_org_id, v_branch_id, 'homework_assignment', NEW.assignment_id, 'homework.' || lower(NEW.event_type),
        NEW.payload, NEW.id::TEXT
    ) ON CONFLICT (idempotency_key) DO NOTHING;
    
    RETURN NEW;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.fn_bridge_homework_events() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_bridge_homework_events() TO authenticated, service_role;

-- Standardizing public.rpc_process_notification_rules
CREATE OR REPLACE FUNCTION public.rpc_process_notification_rules()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_evt RECORD;
    v_rule RECORD;
    v_recipients UUID[];
    v_rec UUID;
    v_msg_id UUID;
BEGIN
    FOR v_evt IN 
        SELECT * FROM public.platform_events 
        WHERE status = 'PENDING' AND event_type NOT IN ('message.queued') AND next_retry_at <= now()
        ORDER BY created_at ASC LIMIT 50 
        FOR UPDATE SKIP LOCKED
    LOOP
        BEGIN
            UPDATE public.platform_events SET status = 'PROCESSING', attempts = attempts + 1 WHERE id = v_evt.id;
            
            -- Check for matching rules
            FOR v_rule IN SELECT * FROM public.notification_rules WHERE organization_id = v_evt.organization_id AND (branch_id = v_evt.branch_id OR branch_id IS NULL) AND event_type = v_evt.event_type
            LOOP
                -- Mock Notification Rule application: Generate a System Notification
                INSERT INTO public.communication_messages (
                    organization_id, branch_id, sender_id, subject, body, type, status
                ) VALUES (
                    v_evt.organization_id, v_evt.branch_id, 
                    (SELECT id FROM public.profiles LIMIT 1), -- In reality, system sender.
                    'System Notification: ' || v_rule.topic,
                    'Event details: ' || v_evt.payload::text,
                    'SYSTEM_NOTIFICATION',
                    'QUEUED'
                ) RETURNING id INTO v_msg_id;
                
                -- Snapshot via outbox loop for this generated message
                INSERT INTO public.platform_events (
                    organization_id, branch_id, aggregate_type, aggregate_id, event_type, payload, idempotency_key
                ) VALUES (
                    v_evt.organization_id, v_evt.branch_id, 'communication_message', v_msg_id, 'message.queued',
                    jsonb_build_object('message_id', v_msg_id),
                    v_msg_id::TEXT || '_queued'
                );
            END LOOP;
            
            UPDATE public.platform_events SET status = 'COMPLETED', processed_at = now() WHERE id = v_evt.id;
        EXCEPTION WHEN OTHERS THEN
            IF v_evt.attempts >= v_evt.max_attempts THEN
                UPDATE public.platform_events SET status = 'DLQ', error_details = jsonb_build_object('error', SQLERRM) WHERE id = v_evt.id;
                INSERT INTO public.dead_letter_queue (organization_id, branch_id, source_table, source_id, payload, error_details, attempts, first_failed_at, last_failed_at)
                VALUES (v_evt.organization_id, v_evt.branch_id, 'platform_events', v_evt.id, v_evt.payload, jsonb_build_object('error', SQLERRM), v_evt.attempts, now(), now());
            ELSE
                UPDATE public.platform_events SET status = 'PENDING', next_retry_at = now() + (power(2, v_evt.attempts) * interval '1 minute'), error_details = jsonb_build_object('error', SQLERRM) WHERE id = v_evt.id;
            END IF;
        END;
    END LOOP;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.rpc_process_notification_rules() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_process_notification_rules() TO authenticated, service_role;

