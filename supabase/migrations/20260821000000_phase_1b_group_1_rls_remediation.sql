-- ==========================================
-- GROUP 1 CLOSED-LOOP RLS REMEDIATION
-- Slices 1-5
-- ==========================================

-- 1. Helper Function
CREATE OR REPLACE FUNCTION public.auth_user_has_branch_role(target_branch_id uuid, target_role_name text)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.branch_memberships bm
        JOIN public.branches b ON b.id = bm.branch_id
        JOIN public.organization_memberships om ON om.organization_id = b.organization_id AND om.user_id = auth.uid()
        JOIN public.user_role_assignments ura ON ura.branch_membership_id = bm.id
        JOIN public.roles r ON r.id = ura.role_id
        WHERE bm.user_id = auth.uid()
          AND bm.branch_id = target_branch_id
          AND lower(replace(r.name, ' ', '')) = lower(replace(target_role_name, ' ', ''))
    );
$$;

-- Explicitly revoke execute from public and grant to authenticated
REVOKE EXECUTE ON FUNCTION public.auth_user_has_branch_role(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.auth_user_has_branch_role(uuid, text) TO authenticated;

-- 2. Phase 3A: Students & Guardians Fixes
-- Students
DROP POLICY IF EXISTS "Branch Admins can insert students in their org" ON public.students;
DROP POLICY IF EXISTS "Branch Admins can insert students" ON public.students;
CREATE POLICY "Branch Admins can insert students"
    ON public.students FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.branches b
            WHERE b.organization_id = students.organization_id
            AND public.auth_user_has_branch_role(b.id, 'branchadmin')
        )
    );

DROP POLICY IF EXISTS "Branch Admins can update students placed in their branches" ON public.students;
DROP POLICY IF EXISTS "Branch Admins can update students" ON public.students;
CREATE POLICY "Branch Admins can update students"
    ON public.students FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.student_id = students.id
            AND public.auth_user_has_branch_role(e.branch_id, 'branchadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.student_id = students.id
            AND public.auth_user_has_branch_role(e.branch_id, 'branchadmin')
        )
    );

-- Enrollments
DROP POLICY IF EXISTS "Branch Admins can insert enrollments" ON public.enrollments;
CREATE POLICY "Branch Admins can insert enrollments"
    ON public.enrollments FOR INSERT TO authenticated
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can update enrollments" ON public.enrollments;
CREATE POLICY "Branch Admins can update enrollments"
    ON public.enrollments FOR UPDATE TO authenticated
    USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'))
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

-- Guardians
DROP POLICY IF EXISTS "Branch Admins can insert guardians in their org" ON public.guardians;
DROP POLICY IF EXISTS "Branch Admins can insert guardians" ON public.guardians;
CREATE POLICY "Branch Admins can insert guardians"
    ON public.guardians FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.branches b
            WHERE b.organization_id = guardians.organization_id
            AND public.auth_user_has_branch_role(b.id, 'branchadmin')
        )
    );

DROP POLICY IF EXISTS "Branch Admins can update visible guardians" ON public.guardians;
DROP POLICY IF EXISTS "Branch Admins can update guardians" ON public.guardians;
CREATE POLICY "Branch Admins can update guardians"
    ON public.guardians FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.student_guardians sg
            JOIN public.enrollments e ON e.student_id = sg.student_id
            WHERE sg.guardian_id = guardians.id
            AND public.auth_user_has_branch_role(e.branch_id, 'branchadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.student_guardians sg
            JOIN public.enrollments e ON e.student_id = sg.student_id
            WHERE sg.guardian_id = guardians.id
            AND public.auth_user_has_branch_role(e.branch_id, 'branchadmin')
        )
    );

-- Student Guardians
DROP POLICY IF EXISTS "Branch Admins can insert student_guardians for visible students" ON public.student_guardians;
DROP POLICY IF EXISTS "Branch Admins can insert student_guardians" ON public.student_guardians;
CREATE POLICY "Branch Admins can insert student_guardians"
    ON public.student_guardians FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.student_id = student_id
            AND public.auth_user_has_branch_role(e.branch_id, 'branchadmin')
        )
        AND public.is_guardian_in_student_org(student_id, guardian_id)
    );

DROP POLICY IF EXISTS "Branch Admins can update student_guardians for visible students" ON public.student_guardians;
DROP POLICY IF EXISTS "Branch Admins can update student_guardians" ON public.student_guardians;
CREATE POLICY "Branch Admins can update student_guardians"
    ON public.student_guardians FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.student_id = student_id
            AND public.auth_user_has_branch_role(e.branch_id, 'branchadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.student_id = student_id
            AND public.auth_user_has_branch_role(e.branch_id, 'branchadmin')
        )
    );


-- 3. Phase 3B: Academic Structure Fixes
-- Academic Years
DROP POLICY IF EXISTS "Branch Admins can insert academic_years" ON public.academic_years;
CREATE POLICY "Branch Admins can insert academic_years"
    ON public.academic_years FOR INSERT TO authenticated
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can update academic_years" ON public.academic_years;
CREATE POLICY "Branch Admins can update academic_years"
    ON public.academic_years FOR UPDATE TO authenticated
    USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'))
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can delete academic_years" ON public.academic_years;
CREATE POLICY "Branch Admins can delete academic_years"
    ON public.academic_years FOR DELETE TO authenticated
    USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

-- Classes
DROP POLICY IF EXISTS "Branch Admins can insert classes" ON public.classes;
CREATE POLICY "Branch Admins can insert classes"
    ON public.classes FOR INSERT TO authenticated
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can update classes" ON public.classes;
CREATE POLICY "Branch Admins can update classes"
    ON public.classes FOR UPDATE TO authenticated
    USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'))
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can delete classes" ON public.classes;
CREATE POLICY "Branch Admins can delete classes"
    ON public.classes FOR DELETE TO authenticated
    USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

-- Sections
DROP POLICY IF EXISTS "Branch Admins can insert sections" ON public.sections;
CREATE POLICY "Branch Admins can insert sections"
    ON public.sections FOR INSERT TO authenticated
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can update sections" ON public.sections;
CREATE POLICY "Branch Admins can update sections"
    ON public.sections FOR UPDATE TO authenticated
    USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'))
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can delete sections" ON public.sections;
CREATE POLICY "Branch Admins can delete sections"
    ON public.sections FOR DELETE TO authenticated
    USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

-- Subjects
DROP POLICY IF EXISTS "Branch Admins can insert subjects" ON public.subjects;
CREATE POLICY "Branch Admins can insert subjects"
    ON public.subjects FOR INSERT TO authenticated
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can update subjects" ON public.subjects;
CREATE POLICY "Branch Admins can update subjects"
    ON public.subjects FOR UPDATE TO authenticated
    USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'))
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can delete subjects" ON public.subjects;
CREATE POLICY "Branch Admins can delete subjects"
    ON public.subjects FOR DELETE TO authenticated
    USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

-- Class Subjects
DROP POLICY IF EXISTS "Branch Admins can insert class_subjects" ON public.class_subjects;
CREATE POLICY "Branch Admins can insert class_subjects"
    ON public.class_subjects FOR INSERT TO authenticated
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can update class_subjects" ON public.class_subjects;
CREATE POLICY "Branch Admins can update class_subjects"
    ON public.class_subjects FOR UPDATE TO authenticated
    USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'))
    WITH CHECK (public.auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can delete class_subjects" ON public.class_subjects;
CREATE POLICY "Branch Admins can delete class_subjects"
    ON public.class_subjects FOR DELETE TO authenticated
    USING (public.auth_user_has_branch_role(branch_id, 'branchadmin'));
