-- Fix student and guardian visibility to rely on student_branch_profiles instead of enrollments.
-- This aligns with Phase 3c3a architectural intent where student_branch_profile establishes branch ownership/tenancy
-- and enrollment is strictly for academic placement.

-- 1. STUDENTS
DROP POLICY IF EXISTS "Branch members can view students placed in their branches" ON public.students;
CREATE POLICY "Branch members can view students placed in their branches"
ON public.students FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.student_branch_profiles sbp
        WHERE sbp.student_id = students.id 
        AND sbp.branch_id = ANY(auth_user_branches())
    )
);

DROP POLICY IF EXISTS "Branch Admins can update students" ON public.students;
CREATE POLICY "Branch Admins can update students"
ON public.students FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.student_branch_profiles sbp
        WHERE sbp.student_id = students.id
        AND public.auth_user_has_branch_role(sbp.branch_id, 'branchadmin')
    )
);

-- 2. STUDENT_GUARDIANS
DROP POLICY IF EXISTS "Branch members can view student_guardians linked to visible students" ON public.student_guardians;
CREATE POLICY "Branch members can view student_guardians linked to visible students"
ON public.student_guardians FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.student_branch_profiles sbp 
        WHERE sbp.student_id = student_guardians.student_id 
        AND sbp.branch_id = ANY(auth_user_branches())
    )
);

DROP POLICY IF EXISTS "Branch Admins can insert student_guardians" ON public.student_guardians;
CREATE POLICY "Branch Admins can insert student_guardians"
ON public.student_guardians FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.student_branch_profiles sbp
        WHERE sbp.student_id = student_id
        AND public.auth_user_has_branch_role(sbp.branch_id, 'branchadmin')
    )
    AND public.is_guardian_in_student_org(student_id, guardian_id)
);

DROP POLICY IF EXISTS "Branch Admins can update student_guardians" ON public.student_guardians;
CREATE POLICY "Branch Admins can update student_guardians"
ON public.student_guardians FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.student_branch_profiles sbp
        WHERE sbp.student_id = student_id
        AND public.auth_user_has_branch_role(sbp.branch_id, 'branchadmin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.student_branch_profiles sbp
        WHERE sbp.student_id = student_id
        AND public.auth_user_has_branch_role(sbp.branch_id, 'branchadmin')
    )
);

-- 3. GUARDIANS
DROP POLICY IF EXISTS "Branch members can view guardians linked to visible students" ON public.guardians;
CREATE POLICY "Branch members can view guardians linked to visible students"
ON public.guardians FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.student_branch_profiles sbp ON sbp.student_id = sg.student_id
        WHERE sg.guardian_id = guardians.id 
        AND sbp.branch_id = ANY(auth_user_branches())
    )
);

DROP POLICY IF EXISTS "Branch Admins can update guardians" ON public.guardians;
CREATE POLICY "Branch Admins can update guardians"
ON public.guardians FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.student_branch_profiles sbp ON sbp.student_id = sg.student_id
        WHERE sg.guardian_id = guardians.id
        AND public.auth_user_has_branch_role(sbp.branch_id, 'branchadmin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.student_branch_profiles sbp ON sbp.student_id = sg.student_id
        WHERE sg.guardian_id = guardians.id
        AND public.auth_user_has_branch_role(sbp.branch_id, 'branchadmin')
    )
);
