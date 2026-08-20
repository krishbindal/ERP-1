-- Slice B: App Config Security & Integrity Remediation

-- 1. Drop old permissive select policy
DROP POLICY IF EXISTS "Branch app configs are viewable by members or super admins" ON public.branch_app_configs;

-- 2. Create strict SELECT policy (Super Admin or Branch Admin only)
CREATE POLICY "Branch app configs viewable by Super Admins and Branch Admins"
ON public.branch_app_configs FOR SELECT TO authenticated
USING (
  (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin())
  OR
  (
    branch_id = ANY(auth_user_branches()) AND
    EXISTS (
      SELECT 1 FROM public.user_role_assignments ura
      JOIN public.branch_memberships bm ON ura.branch_membership_id = bm.id
      JOIN public.roles r ON ura.role_id = r.id
      WHERE bm.user_id = auth.uid() AND bm.branch_id = branch_app_configs.branch_id AND r.name = 'Branch Admin'
    )
  )
);

-- 3. Remove ON DELETE CASCADE
ALTER TABLE public.branch_app_configs 
DROP CONSTRAINT IF EXISTS branch_app_configs_branch_id_fkey,
DROP CONSTRAINT IF EXISTS branch_app_configs_organization_id_fkey,
DROP CONSTRAINT IF EXISTS fk_branch_org;

ALTER TABLE public.branch_app_configs 
ADD CONSTRAINT branch_app_configs_branch_id_fkey 
FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE RESTRICT;

ALTER TABLE public.branch_app_configs 
ADD CONSTRAINT branch_app_configs_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE RESTRICT;

ALTER TABLE public.branch_app_configs
ADD CONSTRAINT fk_branch_org 
FOREIGN KEY (branch_id, organization_id) REFERENCES public.branches(id, organization_id) ON DELETE RESTRICT;

-- 4. Add updated_at trigger (create the helper if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_branch_app_configs_updated_at ON public.branch_app_configs;
CREATE TRIGGER update_branch_app_configs_updated_at
BEFORE UPDATE ON public.branch_app_configs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Harden handle_new_branch SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_branch()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.branch_app_configs (branch_id, organization_id, app_name, slug)
  VALUES (NEW.id, NEW.organization_id, NEW.name, 'branch-' || NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 6. Add Audit Trigger if we had an audit table, otherwise omit as requested
