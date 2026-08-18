-- Phase 3B.5: Architecture Foundations (Identity, Audit, Bulk, Credentials)

-- 1. Identity Links
ALTER TABLE public.guardians ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.students ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX idx_guardians_profile_id ON public.guardians(profile_id);
CREATE INDEX idx_students_profile_id ON public.students(profile_id);

-- 2. Student Branch Profiles
CREATE TABLE public.student_branch_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    student_id_local TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TRANSFERRED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(branch_id, student_id_local), -- Cross-branch identical IDs are allowed, but unique within branch
    UNIQUE(student_id, branch_id) -- One profile per branch for a student
);

CREATE TRIGGER update_student_branch_profiles_updated_at BEFORE UPDATE ON public.student_branch_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER enforce_student_branch_profile_branch_immutable BEFORE UPDATE ON public.student_branch_profiles FOR EACH ROW EXECUTE FUNCTION prevent_branch_id_update();

-- 3. Enrollments Migration (Backward-safe)
ALTER TABLE public.enrollments ADD COLUMN student_branch_profile_id UUID REFERENCES public.student_branch_profiles(id) ON DELETE CASCADE;

-- Backfill: Create branch profiles for existing enrollments
INSERT INTO public.student_branch_profiles (student_id, branch_id)
SELECT DISTINCT student_id, branch_id FROM public.enrollments;

-- Map enrollments to their new branch profile
UPDATE public.enrollments e
SET student_branch_profile_id = sbp.id
FROM public.student_branch_profiles sbp
WHERE e.student_id = sbp.student_id AND e.branch_id = sbp.branch_id;

-- Ensure all enrollments are mapped. We don't drop student_id yet per directive.
-- If this fails, the migration rolls back.
DO $DO_BLOCK$
BEGIN
    IF EXISTS (SELECT 1 FROM public.enrollments WHERE student_branch_profile_id IS NULL) THEN
        RAISE EXCEPTION 'Data migration failed: Some enrollments lack a student_branch_profile_id.';
    END IF;
END $DO_BLOCK$;

ALTER TABLE public.enrollments ALTER COLUMN student_branch_profile_id SET NOT NULL;

-- 4. User Credentials
CREATE TABLE public.user_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id),
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    force_password_reset BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER update_user_credentials_updated_at BEFORE UPDATE ON public.user_credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER enforce_user_credentials_branch_immutable BEFORE UPDATE ON public.user_credentials FOR EACH ROW EXECUTE FUNCTION prevent_branch_id_update();

-- 5. Audit Logging
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    organization_id UUID,
    branch_id UUID,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    reason TEXT,
    request_id UUID
);

CREATE INDEX idx_audit_logs_record ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_id);

CREATE OR REPLACE FUNCTION log_audit_event() RETURNS TRIGGER AS $FUNC$
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
$FUNC$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_enrollments AFTER INSERT OR UPDATE OR DELETE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_student_branch_profiles AFTER INSERT OR UPDATE OR DELETE ON public.student_branch_profiles FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_student_guardians AFTER INSERT OR UPDATE OR DELETE ON public.student_guardians FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- 6. Re-create create_student_with_initial_placement to support student_branch_profiles
CREATE OR REPLACE FUNCTION public.create_student_with_initial_placement(
    p_organization_id UUID,
    p_branch_id UUID,
    p_first_name TEXT,
    p_last_name TEXT,
    p_date_of_birth DATE DEFAULT NULL,
    p_gender TEXT DEFAULT NULL,
    p_middle_name TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $FUNC$
DECLARE
    v_student_id UUID;
    v_profile_id UUID;
BEGIN
    -- Explicitly validate branch membership to prevent abuse of SECURITY DEFINER
    IF NOT (auth_is_super_admin() OR p_branch_id = ANY(auth_user_branches())) THEN
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

    -- 3. Create the enrollment to link them to the branch
    INSERT INTO public.enrollments (
        organization_id, branch_id, student_id, student_branch_profile_id, status
    ) VALUES (
        p_organization_id, p_branch_id, v_student_id, v_profile_id, 'ACTIVE'
    );

    RETURN v_student_id;
END;
$FUNC$;
GRANT EXECUTE ON FUNCTION public.create_student_with_initial_placement TO authenticated;

-- 7. RLS Setup

-- student_branch_profiles
ALTER TABLE public.student_branch_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage student profiles in their orgs"
ON public.student_branch_profiles
TO authenticated
USING (
    branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin()
)
WITH CHECK (
    branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin()
);

CREATE POLICY "Branch members can view student profiles in their branches"
ON public.student_branch_profiles FOR SELECT
TO authenticated
USING (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can insert student profiles"
ON public.student_branch_profiles FOR INSERT
TO authenticated
WITH CHECK (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can update student profiles"
ON public.student_branch_profiles FOR UPDATE
TO authenticated
USING (branch_id = ANY(auth_user_branches()))
WITH CHECK (branch_id = ANY(auth_user_branches()));


-- user_credentials
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- user_credentials RLS
CREATE POLICY "Super Admins can manage credentials in their orgs"
    ON public.user_credentials TO authenticated
    USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin())
    WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

CREATE POLICY "Branch Admins can manage credentials in their branches"
    ON public.user_credentials TO authenticated
    USING (branch_id = ANY(auth_user_branches()))
    WITH CHECK (branch_id = ANY(auth_user_branches()));

-- audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- audit_logs RLS
CREATE POLICY "Super Admins can view audit logs in their orgs"
    ON public.audit_logs FOR SELECT TO authenticated
    USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

CREATE POLICY "Branch Admins can view audit logs in their branches"
    ON public.audit_logs FOR SELECT TO authenticated
    USING (branch_id = ANY(auth_user_branches()));
-- No insert/update/delete policies for audit_logs!

-- Update Guardians and Students RLS to allow self-access
CREATE POLICY "Guardians can view their own record"
ON public.guardians FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "Students can view their own record"
ON public.students FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

-- Break RLS Recursion with SECURITY DEFINER functions
CREATE OR REPLACE FUNCTION public.get_auth_linked_student_ids()
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
    SELECT sg.student_id 
    FROM public.student_guardians sg
    JOIN public.guardians g ON sg.guardian_id = g.id
    WHERE g.profile_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_auth_linked_guardian_ids()
RETURNS SETOF UUID
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
    SELECT sg.guardian_id 
    FROM public.student_guardians sg
    JOIN public.students s ON sg.student_id = s.id
    WHERE s.profile_id = auth.uid();
$$;

CREATE POLICY "Guardians can view their linked students"
ON public.students FOR SELECT
TO authenticated
USING (id IN (SELECT public.get_auth_linked_student_ids()));

CREATE POLICY "Students can view their linked guardians"
ON public.guardians FOR SELECT
TO authenticated
USING (id IN (SELECT public.get_auth_linked_guardian_ids()));

-- 8. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_branch_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_credentials TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;

-- 9. Prevent Branch Reassignment
CREATE TRIGGER prevent_student_profile_branch_reassignment BEFORE UPDATE ON public.student_branch_profiles FOR EACH ROW EXECUTE FUNCTION prevent_branch_id_update();
CREATE TRIGGER prevent_user_credentials_branch_reassignment BEFORE UPDATE ON public.user_credentials FOR EACH ROW EXECUTE FUNCTION prevent_branch_id_update();
