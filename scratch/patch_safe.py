import re

with open("supabase/migrations/20260826000000_phase_5_homework.sql", "r") as f:
    content = f.read()

# 1. Add SET search_path = '' to all SECURITY DEFINER functions
content = re.sub(
    r'(\$\$ LANGUAGE plpgsql SECURITY DEFINER)(;)',
    r"\1 SET search_path = ''\2",
    content
)

# 2. Fix Academic Year timezone bounds
ay_trigger_old = """    SELECT start_date, end_date INTO v_start_date, v_end_date FROM public.academic_years WHERE id = NEW.academic_year_id;
    IF NEW.issue_at::date < v_start_date OR NEW.issue_at::date > v_end_date THEN
        RAISE EXCEPTION 'Issue date must be within academic year bounds';
    END IF;
    IF NEW.due_at::date < v_start_date OR NEW.due_at::date > v_end_date THEN
        RAISE EXCEPTION 'Due date must be within academic year bounds';
    END IF;"""

ay_trigger_new = """    DECLARE
        v_tz TEXT;
    BEGIN
        SELECT start_date, end_date INTO v_start_date, v_end_date FROM public.academic_years WHERE id = NEW.academic_year_id;
        SELECT timezone INTO v_tz FROM public.branches WHERE id = NEW.branch_id;
        
        IF (NEW.issue_at AT TIME ZONE v_tz)::date < v_start_date OR (NEW.issue_at AT TIME ZONE v_tz)::date > v_end_date THEN
            RAISE EXCEPTION 'Issue date must be within academic year bounds';
        END IF;
        IF (NEW.due_at AT TIME ZONE v_tz)::date < v_start_date OR (NEW.due_at AT TIME ZONE v_tz)::date > v_end_date THEN
            RAISE EXCEPTION 'Due date must be within academic year bounds';
        END IF;
    END;"""

content = content.replace(ay_trigger_old, ay_trigger_new)

# 3. Create Event outbox table and emit event on publish
event_table_sql = """
CREATE TABLE public.homework_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.homework_assignments(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);
"""

# Find the end of table creation to insert it
content = content.replace("CREATE TABLE public.homework_audit_logs", event_table_sql + "\nCREATE TABLE public.homework_audit_logs")
content = content.replace("ALTER TABLE public.homework_audit_logs ENABLE ROW LEVEL SECURITY;", "ALTER TABLE public.homework_audit_logs ENABLE ROW LEVEL SECURITY;\nALTER TABLE public.homework_events ENABLE ROW LEVEL SECURITY;")

publish_event_sql = """    UPDATE public.homework_assignments
    SET status = 'PUBLISHED', updated_at = now(), updated_by = auth.uid()
    WHERE id = p_id;
    
    INSERT INTO public.homework_events (assignment_id, event_type, payload)
    VALUES (p_id, 'HOMEWORK_PUBLISHED', jsonb_build_object('assignment_id', p_id, 'status', 'PUBLISHED'));"""

content = content.replace("""    UPDATE public.homework_assignments
    SET status = 'PUBLISHED', updated_at = now(), updated_by = auth.uid()
    WHERE id = p_id;""", publish_event_sql)

# 4. Fix RLS on attachments
hw_assign_rls = """(
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
        WHERE s.profile_id = auth.uid() AND e.section_id = ha.section_id AND e.academic_year_id = ha.academic_year_id AND e.status = 'ENROLLED'
    ))
    OR
    (ha.status IN ('PUBLISHED', 'CLOSED') AND EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.guardians g ON sg.guardian_id = g.id
        JOIN public.enrollments e ON sg.student_id = e.student_id
        WHERE g.profile_id = auth.uid() AND e.section_id = ha.section_id AND e.academic_year_id = ha.academic_year_id AND e.status = 'ENROLLED'
    ))
)"""

sub_rls = """(
    EXISTS (SELECT 1 FROM public.students s WHERE s.profile_id = auth.uid() AND s.id = hs.student_id)
    OR
    EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.guardians g ON sg.guardian_id = g.id
        WHERE g.profile_id = auth.uid() AND sg.student_id = hs.student_id
    )
    OR
    EXISTS (
        SELECT 1 FROM public.homework_assignments ha
        WHERE ha.id = hs.assignment_id
        AND (
            public.auth_user_has_branch_permission(ha.branch_id, 'homework.manage.all')
            OR
            EXISTS (
                SELECT 1 FROM public.teacher_subject_assignments tsa
                JOIN public.staff_branch_profiles sbp ON tsa.staff_branch_profile_id = sbp.id
                JOIN public.staff s_auth ON sbp.staff_id = s_auth.id WHERE s_auth.profile_id = auth.uid() AND tsa.section_id = ha.section_id AND tsa.subject_id = ha.subject_id AND tsa.status = 'ACTIVE'
            )
        )
    )
)"""

content = content.replace(
    """CREATE POLICY "Select homework_attachments" ON public.homework_attachments
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.homework_assignments ha WHERE ha.id = homework_attachments.assignment_id)
);""",
    f"""CREATE POLICY "Select homework_attachments" ON public.homework_attachments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.homework_assignments ha WHERE ha.id = homework_attachments.assignment_id
        AND {hw_assign_rls}
    )
);"""
)

content = content.replace(
    """CREATE POLICY "Select submission_attachments" ON public.submission_attachments
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.homework_submissions hs WHERE hs.id = submission_attachments.submission_id)
);""",
    f"""CREATE POLICY "Select submission_attachments" ON public.submission_attachments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.homework_submissions hs WHERE hs.id = submission_attachments.submission_id
        AND {sub_rls}
    )
);"""
)

# 5. Revoke / Grant EXECUTE on RPCs
grants = """
-- 8. RPC GRANTS
REVOKE EXECUTE ON FUNCTION public.rpc_create_homework_assignment FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_create_homework_assignment TO authenticated;

REVOKE EXECUTE ON FUNCTION public.rpc_update_homework_assignment FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_update_homework_assignment TO authenticated;

REVOKE EXECUTE ON FUNCTION public.rpc_publish_homework FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_publish_homework TO authenticated;

REVOKE EXECUTE ON FUNCTION public.rpc_close_homework FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_close_homework TO authenticated;

REVOKE EXECUTE ON FUNCTION public.rpc_submit_homework FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_submit_homework TO authenticated;

REVOKE EXECUTE ON FUNCTION public.rpc_grade_submission FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_grade_submission TO authenticated;

REVOKE EXECUTE ON FUNCTION public.rpc_return_submission FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_return_submission TO authenticated;

REVOKE EXECUTE ON FUNCTION public.auth_can_access_homework_file FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auth_can_upload_homework_file FROM PUBLIC;
"""

content = content + "\n" + grants

with open("supabase/migrations/20260826000000_phase_5_homework.sql", "w") as f:
    f.write(content)

print("Safely patched migration script.")
