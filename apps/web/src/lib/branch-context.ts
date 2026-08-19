import { createClient } from './supabase/server';

export type UserRole = 'superadmin' | 'branchadmin' | 'teacher' | 'parent' | 'student' | 'unknown';

export interface NormalUserContext {
  type: 'normal';
  userId: string;
  organizationId: string;
  branchId: string;
  branchName: string;
  roles: UserRole[];
}

export interface SuperAdminContext {
  type: 'superadmin';
  userId: string;
  organizationScopes: string[];
  roles: ['superadmin'];
}

export type AppContext = NormalUserContext | SuperAdminContext;

export async function getAppContext(): Promise<AppContext | null> {
  const supabase = await createClient();
  const { data: user, error: authError } = await supabase.auth.getUser();

  if (authError || !user?.user?.id) {
    return null;
  }

  const isSuperAdmin = user.user.app_metadata?.is_super_admin === true;

  if (isSuperAdmin) {
    const { data: orgMemberships } = await supabase
      .from('organization_memberships')
      .select('organization_id')
      .eq('user_id', user.user.id);

    if (orgMemberships && orgMemberships.length > 0) {
      return {
        type: 'superadmin',
        userId: user.user.id,
        organizationScopes: orgMemberships.map(m => m.organization_id),
        roles: ['superadmin']
      };
    }
    return null;
  }

  const { data: memberships, error: membershipError } = await supabase
    .from('branch_memberships')
    .select(`
      branch_id,
      branches (name, organization_id),
      user_role_assignments (
        roles (name)
      )
    `)
    .eq('user_id', user.user.id);

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!memberships || memberships.length === 0) {
    return null; // "No branch context" state
  }

  if (memberships.length > 1) {
    throw new Error("Ambiguous branch context");
  }

  const branchData = memberships[0].branches as unknown as { name: string, organization_id: string };
  const assignments = (memberships[0].user_role_assignments as unknown) as { roles: { name: string } | { name: string }[] | null }[] || [];
  
  // Extract roles explicitly, defaulting to 'unknown' if none
  const roles = assignments
    .map((a) => ((a.roles as unknown) as { name: string })?.name as UserRole)
    .filter(Boolean);

  if (roles.length === 0) {
    roles.push('unknown');
  }

  return {
    type: 'normal',
    userId: user.user.id,
    organizationId: branchData.organization_id,
    branchId: memberships[0].branch_id,
    branchName: branchData.name || 'Unknown Branch',
    roles,
  };
}

// Deprecated: use getAppContext instead where possible
export async function getCurrentAppBranch(): Promise<{ id: string, name: string } | null> {
  const context = await getAppContext();
  if (!context) return null;
  if (context.type === 'superadmin') {
    return null; // Super admins no longer have an implicit branch context
  }
  return { id: context.branchId, name: context.branchName };
}

// --- Authorization Helpers ---

export function auth_is_super_admin(context: AppContext | null): boolean {
  return context?.type === 'superadmin';
}

export function auth_has_org_access(context: AppContext | null, orgId: string): boolean {
  if (!context) return false;
  if (context.type === 'superadmin') {
    return context.organizationScopes.includes(orgId);
  }
  return context.organizationId === orgId;
}

export function auth_has_branch_membership(context: AppContext | null, branch: { id: string, organization_id: string }): boolean {
  if (!context) return false;
  if (context.type === 'superadmin') {
    return context.organizationScopes.includes(branch.organization_id);
  }
  return context.branchId === branch.id;
}

export function auth_has_branch_role(context: AppContext | null, branch: { id: string, organization_id: string }, roleName: UserRole): boolean {
  if (!context) return false;
  if (context.type === 'superadmin') {
    return context.organizationScopes.includes(branch.organization_id);
  }
  return context.branchId === branch.id && context.roles.includes(roleName);
}
