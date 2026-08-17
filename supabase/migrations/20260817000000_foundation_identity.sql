-- Foundation Identity & Tenancy Schema

-- 1. Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Branches
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Organization Memberships
CREATE TABLE organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, user_id)
);

-- 5. Branch Memberships
CREATE TABLE branch_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (branch_id, user_id)
);

-- 6. Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, name)
);

-- 7. Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Role Permissions
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

-- 9. User Role Assignments
CREATE TABLE user_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_membership_id UUID NOT NULL REFERENCES branch_memberships(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (branch_membership_id, role_id)
);

-- Security Helpers
CREATE OR REPLACE FUNCTION auth_is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_super_admin')::boolean, false);
$$;

CREATE OR REPLACE FUNCTION auth_user_branches()
RETURNS UUID[]
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT array_agg(branch_id)
    FROM branch_memberships
    WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION auth_user_organizations()
RETURNS UUID[]
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT array_agg(organization_id)
    FROM organization_memberships
    WHERE user_id = auth.uid();
$$;

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Organizations are viewable by members or super admins"
ON organizations FOR SELECT TO authenticated
USING (id = ANY(auth_user_organizations()) OR auth_is_super_admin());

CREATE POLICY "Branches are viewable by members or super admins"
ON branches FOR SELECT TO authenticated
USING (id = ANY(auth_user_branches()) OR organization_id = ANY(auth_user_organizations()) OR auth_is_super_admin());

CREATE POLICY "Profiles are viewable by self"
ON profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Org Memberships are viewable by self or super admin"
ON organization_memberships FOR SELECT TO authenticated
USING (user_id = auth.uid() OR auth_is_super_admin());

CREATE POLICY "Branch Memberships are viewable by self or super admin"
ON branch_memberships FOR SELECT TO authenticated
USING (user_id = auth.uid() OR auth_is_super_admin());

CREATE POLICY "Roles are viewable by org members or super admin"
ON roles FOR SELECT TO authenticated
USING (organization_id = ANY(auth_user_organizations()) OR auth_is_super_admin());

CREATE POLICY "Permissions are viewable by authenticated users"
ON permissions FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Role Permissions are viewable by authenticated users"
ON role_permissions FOR SELECT TO authenticated
USING (true);

CREATE POLICY "User Role Assignments are viewable by self"
ON user_role_assignments FOR SELECT TO authenticated
USING (branch_membership_id IN (SELECT id FROM branch_memberships WHERE user_id = auth.uid()) OR auth_is_super_admin());

-- Grants
GRANT SELECT ON organizations TO authenticated;
GRANT SELECT ON branches TO authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON organization_memberships TO authenticated;
GRANT SELECT ON branch_memberships TO authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT ON role_permissions TO authenticated;
GRANT SELECT ON user_role_assignments TO authenticated;
