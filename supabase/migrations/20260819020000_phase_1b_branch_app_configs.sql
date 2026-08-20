-- Migration: Phase 1B Branch App Factory Foundation
-- Purpose: Establish branch_app_configs table and provisioning lifecycle

-- 1. Ensure branch and organization consistency
-- We add a unique constraint on branches to allow composite foreign keys
ALTER TABLE public.branches ADD CONSTRAINT branches_id_org_id_key UNIQUE (id, organization_id);

-- 2. Create the branch_app_configs table
CREATE TABLE public.branch_app_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL CONSTRAINT branch_app_configs_branch_id_key UNIQUE REFERENCES public.branches(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    app_name TEXT NOT NULL,
    slug TEXT NOT NULL CONSTRAINT branch_app_configs_slug_key UNIQUE,
    android_package_id TEXT CONSTRAINT branch_app_configs_android_package_id_key UNIQUE,
    ios_bundle_id TEXT CONSTRAINT branch_app_configs_ios_bundle_id_key UNIQUE,
    logo TEXT,
    icon TEXT,
    splash TEXT,
    theme JSONB NOT NULL DEFAULT '{}'::jsonb,
    enabled_modules TEXT[] NOT NULL DEFAULT '{}'::text[],
    support_contact TEXT,
    store_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    notification_identity JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Enforce that the config belongs to the actual organization of the branch
    CONSTRAINT fk_branch_org FOREIGN KEY (branch_id, organization_id) REFERENCES public.branches(id, organization_id) ON DELETE CASCADE
);

-- 3. Automatic configuration creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_branch()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.branch_app_configs (branch_id, organization_id, app_name, slug)
  VALUES (NEW.id, NEW.organization_id, NEW.name, 'branch-' || NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_branch_created
  AFTER INSERT ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_branch();

-- 4. Backfill existing branches
INSERT INTO public.branch_app_configs (branch_id, organization_id, app_name, slug)
SELECT id, organization_id, name, 'branch-' || id::text
FROM public.branches
ON CONFLICT (branch_id) DO NOTHING;

-- 5. Enable RLS
ALTER TABLE public.branch_app_configs ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- SELECT: Super Admins or Branch Members
CREATE POLICY "Branch app configs are viewable by members or super admins"
ON public.branch_app_configs FOR SELECT TO authenticated
USING (branch_id = ANY(auth_user_branches()) OR organization_id = ANY(auth_user_organizations()) OR auth_is_super_admin());

-- UPDATE: Super Admins (within their org)
CREATE POLICY "Super Admins can update branch app configs in their org"
ON public.branch_app_configs FOR UPDATE TO authenticated
USING (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin())
WITH CHECK (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin());

-- UPDATE: Branch Admins (for their branch)
CREATE POLICY "Branch Admins can update their branch app configs"
ON public.branch_app_configs FOR UPDATE TO authenticated
USING (
  branch_id = ANY(auth_user_branches()) AND
  EXISTS (
    SELECT 1 FROM public.user_role_assignments ura
    JOIN public.branch_memberships bm ON ura.branch_membership_id = bm.id
    JOIN public.roles r ON ura.role_id = r.id
    WHERE bm.user_id = auth.uid() AND bm.branch_id = branch_app_configs.branch_id AND r.name = 'Branch Admin'
  )
)
WITH CHECK (
  branch_id = ANY(auth_user_branches()) AND
  EXISTS (
    SELECT 1 FROM public.user_role_assignments ura
    JOIN public.branch_memberships bm ON ura.branch_membership_id = bm.id
    JOIN public.roles r ON ura.role_id = r.id
    WHERE bm.user_id = auth.uid() AND bm.branch_id = branch_app_configs.branch_id AND r.name = 'Branch Admin'
  )
);

-- 7. Permissions
GRANT SELECT, UPDATE ON public.branch_app_configs TO authenticated;
