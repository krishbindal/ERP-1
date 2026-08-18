-- Phase 3B: Academic Structure

-- ==========================================
-- 1. TABLES
-- ==========================================

-- 1.1 academic_years
CREATE TABLE public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_academic_years_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE,
    CONSTRAINT academic_years_branch_name_key UNIQUE (branch_id, name),
    CONSTRAINT academic_years_id_branch_id_key UNIQUE (id, branch_id)
);

-- 1.2 classes
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    academic_year_id UUID NOT NULL,
    name TEXT NOT NULL,
    level INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_classes_academic_year FOREIGN KEY (academic_year_id, branch_id) REFERENCES public.academic_years(id, branch_id) ON DELETE CASCADE,
    CONSTRAINT classes_academic_year_name_key UNIQUE (academic_year_id, name),
    CONSTRAINT classes_id_branch_id_key UNIQUE (id, branch_id)
);

-- 1.3 sections
CREATE TABLE public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    class_id UUID NOT NULL,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 40,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_sections_class FOREIGN KEY (class_id, branch_id) REFERENCES public.classes(id, branch_id) ON DELETE CASCADE,
    CONSTRAINT sections_class_name_key UNIQUE (class_id, name)
);

-- 1.4 subjects
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_subjects_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE,
    CONSTRAINT subjects_branch_code_key UNIQUE (branch_id, code),
    CONSTRAINT subjects_id_branch_id_key UNIQUE (id, branch_id)
);

-- 1.5 class_subjects
CREATE TABLE public.class_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL,
    class_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    is_optional BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_class_subjects_class FOREIGN KEY (class_id, branch_id) REFERENCES public.classes(id, branch_id) ON DELETE CASCADE,
    CONSTRAINT fk_class_subjects_subject FOREIGN KEY (subject_id, branch_id) REFERENCES public.subjects(id, branch_id) ON DELETE CASCADE,
    CONSTRAINT class_subjects_class_subject_key UNIQUE (class_id, subject_id)
);

-- ==========================================
-- 2. INDEXES
-- ==========================================
CREATE INDEX idx_academic_years_branch ON public.academic_years(branch_id);
CREATE INDEX idx_classes_academic_year ON public.classes(academic_year_id);
CREATE INDEX idx_classes_branch ON public.classes(branch_id);
CREATE INDEX idx_sections_class ON public.sections(class_id);
CREATE INDEX idx_sections_branch ON public.sections(branch_id);
CREATE INDEX idx_subjects_branch ON public.subjects(branch_id);
CREATE INDEX idx_class_subjects_class ON public.class_subjects(class_id);
CREATE INDEX idx_class_subjects_subject ON public.class_subjects(subject_id);
CREATE INDEX idx_class_subjects_branch ON public.class_subjects(branch_id);

-- ==========================================
-- 3. TRIGGERS
-- ==========================================
CREATE TRIGGER set_academic_years_updated_at
    BEFORE UPDATE ON public.academic_years
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_sections_updated_at
    BEFORE UPDATE ON public.sections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_subjects_updated_at
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_class_subjects_updated_at
    BEFORE UPDATE ON public.class_subjects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;

-- academic_years RLS
CREATE POLICY "Super Admins can manage academic_years in their orgs"
    ON public.academic_years TO authenticated
    USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin())
    WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

CREATE POLICY "Branch members can view academic_years in their branches"
    ON public.academic_years FOR SELECT TO authenticated
    USING (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can insert academic_years"
    ON public.academic_years FOR INSERT TO authenticated
    WITH CHECK (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can update academic_years"
    ON public.academic_years FOR UPDATE TO authenticated
    USING (branch_id = ANY(auth_user_branches()))
    WITH CHECK (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can delete academic_years"
    ON public.academic_years FOR DELETE TO authenticated
    USING (branch_id = ANY(auth_user_branches()));

-- classes RLS
CREATE POLICY "Super Admins can manage classes in their orgs"
    ON public.classes TO authenticated
    USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin())
    WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

CREATE POLICY "Branch members can view classes in their branches"
    ON public.classes FOR SELECT TO authenticated
    USING (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can insert classes"
    ON public.classes FOR INSERT TO authenticated
    WITH CHECK (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can update classes"
    ON public.classes FOR UPDATE TO authenticated
    USING (branch_id = ANY(auth_user_branches()))
    WITH CHECK (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can delete classes"
    ON public.classes FOR DELETE TO authenticated
    USING (branch_id = ANY(auth_user_branches()));

-- sections RLS
CREATE POLICY "Super Admins can manage sections in their orgs"
    ON public.sections TO authenticated
    USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin())
    WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

CREATE POLICY "Branch members can view sections in their branches"
    ON public.sections FOR SELECT TO authenticated
    USING (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can insert sections"
    ON public.sections FOR INSERT TO authenticated
    WITH CHECK (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can update sections"
    ON public.sections FOR UPDATE TO authenticated
    USING (branch_id = ANY(auth_user_branches()))
    WITH CHECK (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can delete sections"
    ON public.sections FOR DELETE TO authenticated
    USING (branch_id = ANY(auth_user_branches()));

-- subjects RLS
CREATE POLICY "Super Admins can manage subjects in their orgs"
    ON public.subjects TO authenticated
    USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin())
    WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

CREATE POLICY "Branch members can view subjects in their branches"
    ON public.subjects FOR SELECT TO authenticated
    USING (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can insert subjects"
    ON public.subjects FOR INSERT TO authenticated
    WITH CHECK (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can update subjects"
    ON public.subjects FOR UPDATE TO authenticated
    USING (branch_id = ANY(auth_user_branches()))
    WITH CHECK (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can delete subjects"
    ON public.subjects FOR DELETE TO authenticated
    USING (branch_id = ANY(auth_user_branches()));

-- class_subjects RLS
CREATE POLICY "Super Admins can manage class_subjects in their orgs"
    ON public.class_subjects TO authenticated
    USING (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin())
    WITH CHECK (branch_id IN (SELECT id FROM public.branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

CREATE POLICY "Branch members can view class_subjects in their branches"
    ON public.class_subjects FOR SELECT TO authenticated
    USING (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can insert class_subjects"
    ON public.class_subjects FOR INSERT TO authenticated
    WITH CHECK (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can update class_subjects"
    ON public.class_subjects FOR UPDATE TO authenticated
    USING (branch_id = ANY(auth_user_branches()))
    WITH CHECK (branch_id = ANY(auth_user_branches()));

CREATE POLICY "Branch Admins can delete class_subjects"
    ON public.class_subjects FOR DELETE TO authenticated
    USING (branch_id = ANY(auth_user_branches()));

-- ==========================================
-- 5. IMMUTABILITY RULES
-- ==========================================

CREATE OR REPLACE FUNCTION public.prevent_branch_id_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.branch_id IS DISTINCT FROM NEW.branch_id THEN
        RAISE EXCEPTION 'branch_id cannot be modified after creation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_academic_years_branch_id_update
    BEFORE UPDATE ON public.academic_years
    FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_classes_branch_id_update
    BEFORE UPDATE ON public.classes
    FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_sections_branch_id_update
    BEFORE UPDATE ON public.sections
    FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_subjects_branch_id_update
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_class_subjects_branch_id_update
    BEFORE UPDATE ON public.class_subjects
    FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();


-- ==========================================
-- 6. GRANTS
-- ==========================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_years TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_subjects TO authenticated;
