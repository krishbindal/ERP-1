-- Phase 5 Homework & Learning Migration

-- ==========================================
-- 1. PERMISSIONS
-- ==========================================
INSERT INTO public.permissions (name, description) VALUES
    ('homework.manage.all', 'Create, edit, grade, and transition lifecycle states of any homework in the branch');

-- ==========================================
-- 2. TABLES
-- ==========================================

CREATE TABLE public.homework_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE RESTRICT,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
    author_profile_id UUID NOT NULL REFERENCES public.staff_branch_profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    issue_at TIMESTAMPTZ NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    max_marks NUMERIC(5,2),
    status TEXT NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID NOT NULL,
    updated_by UUID NOT NULL,

    CONSTRAINT chk_homework_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'CLOSED')),
    CONSTRAINT chk_homework_dates CHECK (due_at >= issue_at),
    CONSTRAINT chk_max_marks CHECK (max_marks IS NULL OR max_marks > 0)
);

CREATE TABLE public.homework_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.homework_assignments(id) ON DELETE RESTRICT,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    content_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.homework_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.homework_assignments(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    submitted_at TIMESTAMPTZ,
    student_comment TEXT,
    marks_awarded NUMERIC(5,2),
    teacher_feedback TEXT,
    graded_at TIMESTAMPTZ,
    graded_by_profile_id UUID REFERENCES public.staff_branch_profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    version INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT chk_submission_status CHECK (status IN ('PENDING', 'SUBMITTED', 'GRADED', 'RETURNED')),
    CONSTRAINT chk_marks_awarded_positive CHECK (marks_awarded IS NULL OR marks_awarded >= 0),
    CONSTRAINT uq_submission_student UNIQUE(assignment_id, student_id)
);

CREATE TABLE public.submission_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.homework_submissions(id) ON DELETE RESTRICT,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    content_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.homework_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.homework_assignments(id) ON DELETE SET NULL,
    submission_id UUID REFERENCES public.homework_submissions(id) ON DELETE SET NULL,
    actor_id UUID NOT NULL,
    action TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. INDEXES
-- ==========================================
CREATE INDEX idx_homework_section_subject ON public.homework_assignments(section_id, subject_id);
CREATE INDEX idx_homework_due_at ON public.homework_assignments(due_at);
CREATE INDEX idx_homework_branch_ay ON public.homework_assignments(branch_id, academic_year_id);
CREATE INDEX idx_submissions_student ON public.homework_submissions(student_id);
CREATE INDEX idx_submissions_assignment ON public.homework_submissions(assignment_id);

-- ==========================================
-- 4. TRIGGERS & CONSTRAINTS
-- ==========================================

CREATE OR REPLACE FUNCTION public.fn_trg_homework_ay_bounds()
RETURNS trigger AS $$
DECLARE
    v_ay_start DATE;
    v_ay_end DATE;
BEGIN
    SELECT start_date, end_date INTO v_ay_start, v_ay_end
    FROM public.academic_years
    WHERE id = NEW.academic_year_id;

    IF v_ay_start IS NULL THEN
        RAISE EXCEPTION 'Academic year % not found', NEW.academic_year_id;
    END IF;

    IF (NEW.issue_at AT TIME ZONE 'UTC')::DATE < v_ay_start OR (NEW.due_at AT TIME ZONE 'UTC')::DATE > v_ay_end THEN
        RAISE EXCEPTION 'Homework dates must fall within academic year bounds';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_homework_ay_bounds
    BEFORE INSERT OR UPDATE ON public.homework_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_trg_homework_ay_bounds();

CREATE OR REPLACE FUNCTION public.fn_trg_check_marks_awarded()
RETURNS trigger AS $$
DECLARE
    v_max_marks NUMERIC(5,2);
BEGIN
    IF NEW.marks_awarded IS NOT NULL THEN
        SELECT max_marks INTO v_max_marks
        FROM public.homework_assignments
        WHERE id = NEW.assignment_id;

        IF v_max_marks IS NULL THEN
            RAISE EXCEPTION 'Cannot award marks for an ungraded homework assignment';
        END IF;

        IF NEW.marks_awarded > v_max_marks THEN
            RAISE EXCEPTION 'Marks awarded (%) cannot exceed maximum marks (%)', NEW.marks_awarded, v_max_marks;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_marks_awarded
    BEFORE INSERT OR UPDATE ON public.homework_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_trg_check_marks_awarded();

-- ==========================================
-- 5. RPCS (MUTATIONS)
-- ==========================================

CREATE OR REPLACE FUNCTION public.rpc_create_homework_assignment(
    p_branch_id UUID,
    p_academic_year_id UUID,
    p_class_id UUID,
    p_section_id UUID,
    p_subject_id UUID,
    p_title TEXT,
    p_description TEXT,
    p_issue_at TIMESTAMPTZ,
    p_due_at TIMESTAMPTZ,
    p_max_marks NUMERIC
) RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.rpc_update_homework_assignment(
    p_id UUID,
    p_expected_updated_at TIMESTAMPTZ,
    p_title TEXT,
    p_description TEXT,
    p_issue_at TIMESTAMPTZ,
    p_due_at TIMESTAMPTZ,
    p_max_marks NUMERIC
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.rpc_publish_homework(
    p_id UUID,
    p_expected_updated_at TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
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

    INSERT INTO public.homework_audit_logs (assignment_id, actor_id, action, previous_state, new_state)
    VALUES (p_id, auth.uid(), 'STATUS_CHANGED', jsonb_build_object('status', 'DRAFT'), jsonb_build_object('status', 'PUBLISHED'));

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.rpc_close_homework(
    p_id UUID,
    p_expected_updated_at TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.rpc_submit_homework(
    p_assignment_id UUID,
    p_expected_version INTEGER,
    p_comment TEXT
) RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.rpc_grade_submission(
    p_submission_id UUID,
    p_expected_version INTEGER,
    p_marks NUMERIC,
    p_feedback TEXT
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.rpc_return_submission(
    p_submission_id UUID,
    p_expected_version INTEGER,
    p_feedback TEXT
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 6. STORAGE BUCKET & POLICIES
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('homework_assets', 'homework_assets', false)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.auth_can_access_homework_file(p_bucket_id text, p_object_name text)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Homework files are accessible by authorized users"
ON storage.objects FOR SELECT
USING (bucket_id = 'homework_assets' AND public.auth_can_access_homework_file(bucket_id, name));

CREATE OR REPLACE FUNCTION public.auth_can_upload_homework_file(p_bucket_id text, p_object_name text)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Homework files can be uploaded by authorized users"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'homework_assets' AND public.auth_can_upload_homework_file(bucket_id, name));


-- ==========================================
-- 7. DB ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_audit_logs ENABLE ROW LEVEL SECURITY;

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
        WHERE s.profile_id = auth.uid() AND e.section_id = homework_assignments.section_id AND e.academic_year_id = homework_assignments.academic_year_id AND e.status = 'ENROLLED'
    ))
    OR
    (status IN ('PUBLISHED', 'CLOSED') AND EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.guardians g ON sg.guardian_id = g.id
        JOIN public.enrollments e ON sg.student_id = e.student_id
        WHERE g.profile_id = auth.uid() AND e.section_id = homework_assignments.section_id AND e.academic_year_id = homework_assignments.academic_year_id AND e.status = 'ENROLLED'
    ))
);

CREATE POLICY "Select homework_submissions" ON public.homework_submissions
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.profile_id = auth.uid() AND s.id = homework_submissions.student_id)
    OR
    EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.guardians g ON sg.guardian_id = g.id
        WHERE g.profile_id = auth.uid() AND sg.student_id = homework_submissions.student_id
    )
    OR
    EXISTS (
        SELECT 1 FROM public.homework_assignments ha
        WHERE ha.id = homework_submissions.assignment_id
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
);

CREATE POLICY "Select homework_attachments" ON public.homework_attachments
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.homework_assignments ha WHERE ha.id = homework_attachments.assignment_id)
);

CREATE POLICY "Select submission_attachments" ON public.submission_attachments
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.homework_submissions hs WHERE hs.id = submission_attachments.submission_id)
);
