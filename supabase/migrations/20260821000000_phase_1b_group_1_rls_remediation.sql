-- ==========================================
-- GROUP 1 CLOSED-LOOP RLS REMEDIATION
-- Slices 1-5
-- ==========================================

-- 1. Helper Function
CREATE OR REPLACE FUNCTION auth_user_has_branch_role(target_branch_id uuid, target_role_name text)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM branch_memberships bm
        JOIN branches b ON b.id = bm.branch_id
        JOIN organization_memberships om ON om.organization_id = b.organization_id AND om.user_id = auth.uid()
        JOIN user_role_assignments ura ON ura.branch_membership_id = bm.id
        JOIN roles r ON r.id = ura.role_id
        WHERE bm.user_id = auth.uid()
          AND bm.branch_id = target_branch_id
          AND lower(replace(r.name, ' ', '')) = lower(replace(target_role_name, ' ', ''))
    );
$$;

-- 2. Phase 3A: Students & Guardians Fixes
-- Students
DROP POLICY IF EXISTS "Branch Admins can insert students in their org" ON public.students;
CREATE POLICY "Branch Admins can insert students in their org"
    ON public.students FOR INSERT TO authenticated
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can update students placed in their branches" ON public.students;
CREATE POLICY "Branch Admins can update students placed in their branches"
    ON public.students FOR UPDATE TO authenticated
    USING (auth_user_has_branch_role(branch_id, 'branchadmin'))
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

-- Enrollments
DROP POLICY IF EXISTS "Branch Admins can insert enrollments" ON public.enrollments;
CREATE POLICY "Branch Admins can insert enrollments"
    ON public.enrollments FOR INSERT TO authenticated
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can update enrollments" ON public.enrollments;
CREATE POLICY "Branch Admins can update enrollments"
    ON public.enrollments FOR UPDATE TO authenticated
    USING (auth_user_has_branch_role(branch_id, 'branchadmin'))
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

-- Guardians
DROP POLICY IF EXISTS "Branch Admins can insert guardians in their org" ON public.guardians;
CREATE POLICY "Branch Admins can insert guardians in their org"
    ON public.guardians FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.student_guardians sg
            JOIN public.enrollments e ON e.student_id = sg.student_id
            WHERE sg.guardian_id = guardians.id
            AND auth_user_has_branch_role(e.branch_id, 'branchadmin')
        )
    );

DROP POLICY IF EXISTS "Branch Admins can update visible guardians" ON public.guardians;
CREATE POLICY "Branch Admins can update visible guardians"
    ON public.guardians FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.student_guardians sg
            JOIN public.enrollments e ON e.student_id = sg.student_id
            WHERE sg.guardian_id = guardians.id
            AND auth_user_has_branch_role(e.branch_id, 'branchadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.student_guardians sg
            JOIN public.enrollments e ON e.student_id = sg.student_id
            WHERE sg.guardian_id = guardians.id
            AND auth_user_has_branch_role(e.branch_id, 'branchadmin')
        )
    );

-- Student Guardians
DROP POLICY IF EXISTS "Branch Admins can insert student_guardians for visible students" ON public.student_guardians;
CREATE POLICY "Branch Admins can insert student_guardians for visible students"
    ON public.student_guardians FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.student_id = student_id
            AND auth_user_has_branch_role(e.branch_id, 'branchadmin')
        )
    );

DROP POLICY IF EXISTS "Branch Admins can update student_guardians for visible students" ON public.student_guardians;
CREATE POLICY "Branch Admins can update student_guardians for visible students"
    ON public.student_guardians FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.student_id = student_id
            AND auth_user_has_branch_role(e.branch_id, 'branchadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.student_id = student_id
            AND auth_user_has_branch_role(e.branch_id, 'branchadmin')
        )
    );


-- 3. Phase 3B: Academic Structure Fixes
-- Academic Years
DROP POLICY IF EXISTS "Branch Admins can insert academic_years" ON public.academic_years;
CREATE POLICY "Branch Admins can insert academic_years"
    ON public.academic_years FOR INSERT TO authenticated
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can update academic_years" ON public.academic_years;
CREATE POLICY "Branch Admins can update academic_years"
    ON public.academic_years FOR UPDATE TO authenticated
    USING (auth_user_has_branch_role(branch_id, 'branchadmin'))
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can delete academic_years" ON public.academic_years;
CREATE POLICY "Branch Admins can delete academic_years"
    ON public.academic_years FOR DELETE TO authenticated
    USING (auth_user_has_branch_role(branch_id, 'branchadmin'));

-- Classes
DROP POLICY IF EXISTS "Branch Admins can insert classes" ON public.classes;
CREATE POLICY "Branch Admins can insert classes"
    ON public.classes FOR INSERT TO authenticated
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can update classes" ON public.classes;
CREATE POLICY "Branch Admins can update classes"
    ON public.classes FOR UPDATE TO authenticated
    USING (auth_user_has_branch_role(branch_id, 'branchadmin'))
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can delete classes" ON public.classes;
CREATE POLICY "Branch Admins can delete classes"
    ON public.classes FOR DELETE TO authenticated
    USING (auth_user_has_branch_role(branch_id, 'branchadmin'));

-- Sections
DROP POLICY IF EXISTS "Branch Admins can insert sections" ON public.sections;
CREATE POLICY "Branch Admins can insert sections"
    ON public.sections FOR INSERT TO authenticated
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can update sections" ON public.sections;
CREATE POLICY "Branch Admins can update sections"
    ON public.sections FOR UPDATE TO authenticated
    USING (auth_user_has_branch_role(branch_id, 'branchadmin'))
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can delete sections" ON public.sections;
CREATE POLICY "Branch Admins can delete sections"
    ON public.sections FOR DELETE TO authenticated
    USING (auth_user_has_branch_role(branch_id, 'branchadmin'));

-- Subjects
DROP POLICY IF EXISTS "Branch Admins can insert subjects" ON public.subjects;
CREATE POLICY "Branch Admins can insert subjects"
    ON public.subjects FOR INSERT TO authenticated
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can update subjects" ON public.subjects;
CREATE POLICY "Branch Admins can update subjects"
    ON public.subjects FOR UPDATE TO authenticated
    USING (auth_user_has_branch_role(branch_id, 'branchadmin'))
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can delete subjects" ON public.subjects;
CREATE POLICY "Branch Admins can delete subjects"
    ON public.subjects FOR DELETE TO authenticated
    USING (auth_user_has_branch_role(branch_id, 'branchadmin'));

-- Class Subjects
DROP POLICY IF EXISTS "Branch Admins can insert class_subjects" ON public.class_subjects;
CREATE POLICY "Branch Admins can insert class_subjects"
    ON public.class_subjects FOR INSERT TO authenticated
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can update class_subjects" ON public.class_subjects;
CREATE POLICY "Branch Admins can update class_subjects"
    ON public.class_subjects FOR UPDATE TO authenticated
    USING (auth_user_has_branch_role(branch_id, 'branchadmin'))
    WITH CHECK (auth_user_has_branch_role(branch_id, 'branchadmin'));

DROP POLICY IF EXISTS "Branch Admins can delete class_subjects" ON public.class_subjects;
CREATE POLICY "Branch Admins can delete class_subjects"
    ON public.class_subjects FOR DELETE TO authenticated
    USING (auth_user_has_branch_role(branch_id, 'branchadmin'));
