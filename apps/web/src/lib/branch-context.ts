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
  roles: UserRole[];
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

  const [membership] = memberships;
  const branchDataRaw = membership.branches;
  const branchData = Array.isArray(branchDataRaw) ? branchDataRaw[0] : branchDataRaw;
  if (!branchData) {
    throw new Error("Missing branch data");
  }

  const assignmentsRaw = membership.user_role_assignments || [];
  const assignments = Array.isArray(assignmentsRaw) ? assignmentsRaw : [assignmentsRaw];
  
  // Extract roles explicitly, defaulting to 'unknown' if none
  const roles = assignments
    .map((a: { roles?: unknown }) => {
      const rolesRaw = a.roles as { name: string } | { name: string }[] | null;
      if (!rolesRaw) return null;
      const rawName = Array.isArray(rolesRaw) ? rolesRaw[0]?.name : rolesRaw.name;
      if (!rawName) return null;
      const normalized = String(rawName).toLowerCase().replace(/\s/g, '');
      if (['superadmin', 'branchadmin', 'teacher', 'parent', 'student'].includes(normalized)) {
        return normalized as UserRole;
      }
      return 'unknown' as UserRole;
    })
    .filter(Boolean) as UserRole[];

  if (roles.length === 0) {
    roles.push('unknown');
  }

  return {
    type: 'normal',
    userId: user.user.id,
    organizationId: branchData.organization_id,
    branchId: membership.branch_id,
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
  return context.branchId === branch.id && context.organizationId === branch.organization_id;
}

export function auth_has_branch_role(context: AppContext | null, branch: { id: string, organization_id: string }, roleName: UserRole): boolean {
  if (!context) return false;
  
  if (context.type === 'superadmin') {
    return context.organizationScopes.includes(branch.organization_id) && (context.roles as UserRole[]).includes(roleName);
  }
  
  return context.branchId === branch.id && 
         context.organizationId === branch.organization_id && 
         context.roles.includes(roleName);
}

export async function getContextBranchId(explicitBranchId?: string): Promise<string> {
  const context = await getAppContext();
  if (!context) throw new Error(" No context available.)
export async function getContextBranchId(explicitBranchId?: string): Promise<string> {
  const context = await getAppContext();
  if (!context) throw new Error("No context available.");
  
  if (context.type === 'superadmin') {
    if (!explicitBranchId) {
      throw new Error("Super Admins must explicitly provide a branch ID.");
    }
    const supabase = await createClient();
    const { data: branch, error } = await supabase
      .from('branches')
      .select('organization_id')
      .eq('id', explicitBranchId)
      .single();
    if (error || !branch) throw new Error("Branch not found or inaccessible.");
    if (!auth_has_org_access(context, branch.organization_id)) {
      throw new Error("Branch does not belong to your organization.");
    }
    return explicitBranchId;
  }
  
  if (context.type === 'normal') {
    if (explicitBranchId && explicitBranchId !== context.branchId) {
      throw new Error("Normal users cannot target arbitrary branches.");
    }
    return context.branchId;
  }
  throw new Error("Unknown context type.");
}

export async function verifyPageBranchContext(explicitBranchId: string | undefined): Promise<{ 
  branchId: string | null; 
  isAuthorized: boolean; 
  isReadOnly: boolean; 
  errorState: 'NO_CONTEXT' | 'NO_BRANCH_SELECTED' | 'ACCESS_DENIED' | null;
}> {
  const context = await getAppContext();
  if (!context) return { branchId: null, isAuthorized: false, isReadOnly: true, errorState: 'NO_CONTEXT' };

  const branchId = context.type === 'normal' ? context.branchId : explicitBranchId || null;
  if (!branchId) {
    if (context.type === 'superadmin') return { branchId: null, isAuthorized: false, isReadOnly: true, errorState: 'NO_BRANCH_SELECTED' };
    return { branchId: null, isAuthorized: false, isReadOnly: true, errorState: 'NO_CONTEXT' };
  }

  if (context.type === 'superadmin') {
    const supabase = await createClient();
    const { data: branch } = await supabase.from('branches').select('organization_id').eq('id', branchId).single();
    if (branch && auth_has_org_access(context, branch.organization_id)) {
      return { branchId, isAuthorized: true, isReadOnly: false, errorState: null };
    } else {
       return { branchId, isAuthorized: false, isReadOnly: true, errorState: 'ACCESS_DENIED' };
    }
  } 
  
  if (context.type === 'normal') {
    if (explicitBranchId && explicitBranchId !== context.branchId) {
      return { branchId, isAuthorized: false, isReadOnly: true, errorState: 'ACCESS_DENIED' };
    }
    return { 
      branchId, 
      isAuthorized: true, 
      isReadOnly: !context.roles.includes('branchadmin'), 
      errorState: null 
    };
  }

  return { branchId: null, isAuthorized: false, isReadOnly: true, errorState: 'ACCESS_DENIED' };
}
