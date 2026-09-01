
-- Fix the ENROLLED status which should be ACTIVE
-- 1. Fix the storage RLS helper function
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
                WHERE s.profile_id = auth.uid() AND e.section_id = v_assignment.section_id AND e.academic_year_id = v_assignment.academic_year_id AND e.status = 'ACTIVE'
            ) INTO v_is_authorized;
            IF v_is_authorized THEN RETURN TRUE; END IF;

            SELECT EXISTS (
                SELECT 1 FROM public.student_guardians sg
                JOIN public.guardians g ON sg.guardian_id = g.id
                JOIN public.enrollments e ON sg.student_id = e.student_id
                WHERE g.profile_id = auth.uid() AND e.section_id = v_assignment.section_id AND e.academic_year_id = v_assignment.academic_year_id AND e.status = 'ACTIVE'
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

-- 2. Fix the homework_assignments RLS Policy
DROP POLICY "Select homework_assignments" ON public.homework_assignments;
CREATE POLICY "Select homework_assignments" ON public.homework_assignments
FOR SELECT USING (
    public.auth_user_has_branch_permission(branch_id, 'homework.manage.all')
    OR
    EXISTS (
        SELECT 1 FROM public.teacher_subject_assignments tsa
        JOIN public.staff_branch_profiles sbp ON tsa.staff_branch_profile_id = sbp.id
        JOIN public.staff s_auth ON sbp.staff_id = s_auth.id WHERE s_auth.profile_id = auth.uid() AND tsa.section_id = homework_assignments.section_id AND tsa.subject_id = homework_assignments.subject_id AND tsa.status = 'ACTIVE'
    )
    OR
    (status IN ('PUBLISHED', 'CLOSED') AND EXISTS (
        SELECT 1 FROM public.enrollments e
        JOIN public.students s ON e.student_id = s.id
        WHERE s.profile_id = auth.uid() AND e.section_id = homework_assignments.section_id AND e.academic_year_id = homework_assignments.academic_year_id AND e.status = 'ACTIVE'
    ))
    OR
    (status IN ('PUBLISHED', 'CLOSED') AND EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.guardians g ON sg.guardian_id = g.id
        JOIN public.enrollments e ON sg.student_id = e.student_id
        WHERE g.profile_id = auth.uid() AND e.section_id = homework_assignments.section_id AND e.academic_year_id = homework_assignments.academic_year_id AND e.status = 'ACTIVE'
    ))
);

-- 3. Fix the homework_attachments RLS Policy
DROP POLICY "Select homework_attachments" ON public.homework_attachments;
CREATE POLICY "Select homework_attachments" ON public.homework_attachments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.homework_assignments ha WHERE ha.id = homework_attachments.assignment_id
        AND (
    public.auth_user_has_branch_permission(ha.branch_id, 'homework.manage.all')
    OR
    EXISTS (
        SELECT 1 FROM public.teacher_subject_assignments tsa
        JOIN public.staff_branch_profiles sbp ON tsa.staff_branch_profile_id = sbp.id
        JOIN public.staff s_auth ON sbp.staff_id = s_auth.id WHERE s_auth.profile_id = auth.uid() AND tsa.section_id = ha.section_id AND tsa.subject_id = ha.subject_id AND tsa.status = 'ACTIVE'
    )
    OR
    (ha.status IN ('PUBLISHED', 'CLOSED') AND EXISTS (
        SELECT 1 FROM public.enrollments e
        JOIN public.students s ON e.student_id = s.id
        WHERE s.profile_id = auth.uid() AND e.section_id = ha.section_id AND e.academic_year_id = ha.academic_year_id AND e.status = 'ACTIVE'
    ))
    OR
    (ha.status IN ('PUBLISHED', 'CLOSED') AND EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.guardians g ON sg.guardian_id = g.id
        JOIN public.enrollments e ON sg.student_id = e.student_id
        WHERE g.profile_id = auth.uid() AND e.section_id = ha.section_id AND e.academic_year_id = ha.academic_year_id AND e.status = 'ACTIVE'
    ))
        )
    )
);


-- 4. Fix submit_homework RPC
CREATE OR REPLACE FUNCTION public.submit_homework(
    p_assignment_id UUID,
    p_comment TEXT DEFAULT NULL,
    p_expected_version INTEGER DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    v_student_id UUID;
    v_assignment public.homework_assignments%ROWTYPE;
    v_submission public.homework_submissions%ROWTYPE;
    v_is_enrolled BOOLEAN;
BEGIN
    SELECT * INTO v_assignment FROM public.homework_assignments WHERE id = p_assignment_id FOR UPDATE;
    IF v_assignment.id IS NULL THEN RAISE EXCEPTION 'Assignment not found'; END IF;
    IF v_assignment.status != 'PUBLISHED' THEN RAISE EXCEPTION 'Assignment is not published'; END IF;
    IF v_assignment.due_at < now() THEN RAISE EXCEPTION 'Cannot submit after due date'; END IF;

    SELECT id INTO v_student_id FROM public.students WHERE profile_id = auth.uid() AND status = 'ACTIVE' LIMIT 1;
    IF v_student_id IS NULL THEN RAISE EXCEPTION 'Active student profile not found for user'; END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE student_id = v_student_id
          AND section_id = v_assignment.section_id
          AND academic_year_id = v_assignment.academic_year_id
          AND status = 'ACTIVE'
    ) INTO v_is_enrolled;
    IF NOT v_is_enrolled THEN RAISE EXCEPTION 'Student is not enrolled in this section'; END IF;

    SELECT * INTO v_submission FROM public.homework_submissions 
    WHERE assignment_id = p_assignment_id AND student_id = v_student_id FOR UPDATE;

    IF v_submission.id IS NULL THEN
        IF p_expected_version != 0 THEN RAISE EXCEPTION 'Concurrency conflict: Submission already exists or version mismatch'; END IF;
        
        INSERT INTO public.homework_submissions (
            assignment_id, student_id, status, submitted_at, student_comment, version
        ) VALUES (
            p_assignment_id, v_student_id, 'SUBMITTED', now(), p_comment, 1
        ) RETURNING * INTO v_submission;

        -- Create Audit Log
        INSERT INTO public.homework_audit_logs (
            assignment_id, actor_id, action, entity_type, entity_id, details
        ) VALUES (
            p_assignment_id, auth.uid(), 'CREATE_SUBMISSION', 'SUBMISSION', v_submission.id,
            jsonb_build_object('status', 'SUBMITTED')
        );
    ELSE
        IF v_submission.version != p_expected_version THEN RAISE EXCEPTION 'Concurrency conflict: version mismatch'; END IF;
        IF v_submission.status IN ('GRADED') THEN RAISE EXCEPTION 'Cannot resubmit a graded homework'; END IF;
        
        UPDATE public.homework_submissions SET
            status = 'SUBMITTED',
            submitted_at = now(),
            student_comment = COALESCE(p_comment, student_comment),
            version = version + 1,
            updated_at = now()
        WHERE id = v_submission.id RETURNING * INTO v_submission;

        INSERT INTO public.homework_audit_logs (
            assignment_id, actor_id, action, entity_type, entity_id, details
        ) VALUES (
            p_assignment_id, auth.uid(), 'UPDATE_SUBMISSION', 'SUBMISSION', v_submission.id,
            jsonb_build_object('status', 'SUBMITTED', 'version', v_submission.version)
        );
    END IF;

    RETURN v_submission.id;
END;
$function$;

