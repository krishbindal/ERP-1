-- Phase E - Attendance Remediation

BEGIN;

-- 1. Create missing helper function for student's own ID
CREATE OR REPLACE FUNCTION public.get_auth_my_student_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
    SELECT s.id 
    FROM public.students s
    WHERE s.profile_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_my_student_ids() TO authenticated;

-- Helper to get sections the user's linked students are enrolled in, bypassing RLS
CREATE OR REPLACE FUNCTION public.get_auth_linked_section_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
    SELECT e.section_id 
    FROM public.enrollments e
    WHERE e.student_id IN (
        SELECT student_id 
        FROM public.student_guardians sg
        JOIN public.guardians g ON sg.guardian_id = g.id
        WHERE g.profile_id = auth.uid()
    );
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_linked_section_ids() TO authenticated;

-- Helper to get sections the user themselves are enrolled in
CREATE OR REPLACE FUNCTION public.get_auth_my_section_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
    SELECT e.section_id 
    FROM public.enrollments e
    JOIN public.students s ON e.student_id = s.id
    WHERE s.profile_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_my_section_ids() TO authenticated;


-- 2. Fix attendance_sessions policies (BREAK RECURSION)
DROP POLICY IF EXISTS "Parents can view published child attendance_sessions" ON public.attendance_sessions;
DROP POLICY IF EXISTS "Students can view published own attendance_sessions" ON public.attendance_sessions;

CREATE POLICY "Parents can view published child attendance_sessions"
    ON public.attendance_sessions
    FOR SELECT
    TO authenticated
    USING (
        published_at IS NOT NULL 
        AND section_id IN (SELECT public.get_auth_linked_section_ids())
    );

CREATE POLICY "Students can view published own attendance_sessions"
    ON public.attendance_sessions
    FOR SELECT
    TO authenticated
    USING (
        published_at IS NOT NULL 
        AND section_id IN (SELECT public.get_auth_my_section_ids())
    );

-- 3. Fix attendance_records policies
DROP POLICY IF EXISTS "Parents can view published child attendance_records" ON public.attendance_records;
DROP POLICY IF EXISTS "Students can view published own attendance_records" ON public.attendance_records;

CREATE POLICY "Parents can view published child attendance_records"
    ON public.attendance_records
    FOR SELECT
    TO authenticated
    USING (
        student_id IN (SELECT public.get_auth_linked_student_ids())
        AND session_id IN (
            SELECT id 
            FROM public.attendance_sessions 
            WHERE published_at IS NOT NULL
        )
    );

CREATE POLICY "Students can view published own attendance_records"
    ON public.attendance_records
    FOR SELECT
    TO authenticated
    USING (
        student_id IN (SELECT public.get_auth_my_student_ids())
        AND session_id IN (
            SELECT id 
            FROM public.attendance_sessions 
            WHERE published_at IS NOT NULL
        )
    );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_records TO authenticated;
GRANT SELECT ON public.attendance_audit_logs TO authenticated;

COMMIT;
