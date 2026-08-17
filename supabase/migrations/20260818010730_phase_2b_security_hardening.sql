-- Phase 2B Security Hardening

-- 1. Status lifecycle columns
ALTER TABLE organizations ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED'));
ALTER TABLE branches ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED'));
ALTER TABLE organization_memberships ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED'));
ALTER TABLE branch_memberships ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED'));

-- Since profiles maps to auth.users, we can also add status there if needed, but for now we'll rely on the existing auth.users state, or we can add it to profiles.
ALTER TABLE profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED'));

-- 2. Revise Security Helpers
-- We recreate them to ensure they check the status and strict Super Admin bounds.

CREATE OR REPLACE FUNCTION auth_is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_super_admin')::boolean, false);
$$;

CREATE OR REPLACE FUNCTION auth_user_organizations()
RETURNS UUID[]
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT array_agg(organization_id)
    FROM organization_memberships
    WHERE user_id = auth.uid() AND status = 'ACTIVE';
$$;

CREATE OR REPLACE FUNCTION auth_user_branches()
RETURNS UUID[]
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT array_agg(branch_id)
    FROM branch_memberships
    WHERE user_id = auth.uid() AND status = 'ACTIVE';
$$;

-- 3. Update Existing RLS Policies for SELECT
-- Organizations: Super admin must be bounded by organization_memberships
DROP POLICY IF EXISTS "Organizations are viewable by members or super admins" ON organizations;
CREATE POLICY "Organizations are viewable by members or super admins"
ON organizations FOR SELECT TO authenticated
USING (
    status = 'ACTIVE' AND (
        id = ANY(auth_user_organizations()) OR 
        (id = ANY(auth_user_organizations()) AND auth_is_super_admin())
    )
);

-- Branches: Bound super admin by organization_memberships
DROP POLICY IF EXISTS "Branches are viewable by members or super admins" ON branches;
CREATE POLICY "Branches are viewable by members or super admins"
ON branches FOR SELECT TO authenticated
USING (
    status = 'ACTIVE' AND (
        id = ANY(auth_user_branches()) OR 
        (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin())
    )
);

-- Profiles
DROP POLICY IF EXISTS "Profiles are viewable by self" ON profiles;
CREATE POLICY "Profiles are viewable by self"
ON profiles FOR SELECT TO authenticated
USING (id = auth.uid() AND status = 'ACTIVE');

-- Org Memberships
DROP POLICY IF EXISTS "Org Memberships are viewable by self or super admin" ON organization_memberships;
CREATE POLICY "Org Memberships are viewable by self or super admin"
ON organization_memberships FOR SELECT TO authenticated
USING (
    status = 'ACTIVE' AND (
        user_id = auth.uid() OR 
        (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin())
    )
);

-- Branch Memberships
DROP POLICY IF EXISTS "Branch Memberships are viewable by self or super admin" ON branch_memberships;
CREATE POLICY "Branch Memberships are viewable by self or super admin"
ON branch_memberships FOR SELECT TO authenticated
USING (
    status = 'ACTIVE' AND (
        user_id = auth.uid() OR 
        (branch_id IN (SELECT id FROM branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin())
    )
);

-- Roles
DROP POLICY IF EXISTS "Roles are viewable by org members or super admin" ON roles;
CREATE POLICY "Roles are viewable by org members or super admin"
ON roles FOR SELECT TO authenticated
USING (
    organization_id = ANY(auth_user_organizations()) OR 
    (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin())
);

-- User Role Assignments
DROP POLICY IF EXISTS "User Role Assignments are viewable by self" ON user_role_assignments;
CREATE POLICY "User Role Assignments are viewable by self"
ON user_role_assignments FOR SELECT TO authenticated
USING (
    branch_membership_id IN (SELECT id FROM branch_memberships WHERE user_id = auth.uid() AND status = 'ACTIVE') OR 
    (branch_membership_id IN (SELECT id FROM branch_memberships WHERE branch_id IN (SELECT id FROM branches WHERE organization_id = ANY(auth_user_organizations()))) AND auth_is_super_admin())
);

-- 4. INSERT/UPDATE/DELETE RLS Policies
-- To prevent tampering and privilege escalation, we only grant necessary CRUD privileges to authenticated role,
-- but we also must write strict RLS for safety.

-- Organizations
-- Only Super Admins can UPDATE organizations they belong to. Nobody can INSERT/DELETE organizations from the client.
CREATE POLICY "Super Admins can update their organizations"
ON organizations FOR UPDATE TO authenticated
USING (id = ANY(auth_user_organizations()) AND auth_is_super_admin())
WITH CHECK (id = ANY(auth_user_organizations()) AND auth_is_super_admin());

-- Branches
-- Only Super Admins can INSERT/UPDATE branches in their organizations.
CREATE POLICY "Super Admins can insert branches in their organizations"
ON branches FOR INSERT TO authenticated
WITH CHECK (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin());

CREATE POLICY "Super Admins can update branches in their organizations"
ON branches FOR UPDATE TO authenticated
USING (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin())
WITH CHECK (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin());

-- Profiles
-- Users can update their own profile details.
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Branch Memberships
-- Super admins can INSERT/UPDATE branch memberships within their org.
CREATE POLICY "Super Admins can insert branch memberships"
ON branch_memberships FOR INSERT TO authenticated
WITH CHECK (branch_id IN (SELECT id FROM branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

CREATE POLICY "Super Admins can update branch memberships"
ON branch_memberships FOR UPDATE TO authenticated
USING (branch_id IN (SELECT id FROM branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin())
WITH CHECK (branch_id IN (SELECT id FROM branches WHERE organization_id = ANY(auth_user_organizations())) AND auth_is_super_admin());

-- Roles and Role Permissions
-- Only Super Admins can manage roles within their orgs.
CREATE POLICY "Super Admins can insert roles"
ON roles FOR INSERT TO authenticated
WITH CHECK (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin());

CREATE POLICY "Super Admins can update roles"
ON roles FOR UPDATE TO authenticated
USING (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin())
WITH CHECK (organization_id = ANY(auth_user_organizations()) AND auth_is_super_admin());

-- User Role Assignments
-- Only Super Admins can assign roles to branch memberships in their org.
CREATE POLICY "Super Admins can manage user role assignments"
ON user_role_assignments FOR ALL TO authenticated
USING (branch_membership_id IN (SELECT id FROM branch_memberships WHERE branch_id IN (SELECT id FROM branches WHERE organization_id = ANY(auth_user_organizations()))) AND auth_is_super_admin())
WITH CHECK (branch_membership_id IN (SELECT id FROM branch_memberships WHERE branch_id IN (SELECT id FROM branches WHERE organization_id = ANY(auth_user_organizations()))) AND auth_is_super_admin());

-- 5. Revoke/Grant Explicit PostgreSQL Privileges
-- Start by revoking all from authenticated to ensure clean slate.
REVOKE ALL ON organizations FROM authenticated;
REVOKE ALL ON branches FROM authenticated;
REVOKE ALL ON profiles FROM authenticated;
REVOKE ALL ON organization_memberships FROM authenticated;
REVOKE ALL ON branch_memberships FROM authenticated;
REVOKE ALL ON roles FROM authenticated;
REVOKE ALL ON permissions FROM authenticated;
REVOKE ALL ON role_permissions FROM authenticated;
REVOKE ALL ON user_role_assignments FROM authenticated;

-- Grant selective SELECTs
GRANT SELECT ON organizations TO authenticated;
GRANT SELECT ON branches TO authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON organization_memberships TO authenticated;
GRANT SELECT ON branch_memberships TO authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;
GRANT SELECT ON user_role_assignments TO authenticated;

-- Grant selective INSERT/UPDATE/DELETE where RLS will actually evaluate
-- For tampering tests, if they don't even have UPDATE grant, it fails via Postgres which is fine, 
-- but to test RLS tampering protection properly, we grant UPDATE so RLS kicks in.
GRANT UPDATE ON organizations TO authenticated;
GRANT INSERT, UPDATE ON branches TO authenticated;
GRANT UPDATE ON profiles TO authenticated;
-- Ordinary users should NEVER be able to insert organization_memberships!
-- We DO NOT grant INSERT/UPDATE on organization_memberships to authenticated. Only superuser/backend can.
GRANT INSERT, UPDATE ON branch_memberships TO authenticated;
GRANT INSERT, UPDATE ON roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON user_role_assignments TO authenticated;
