import { createClient } from './supabase/server';

export type UserRole = 'superadmin' | 'branchadmin' | 'teacher' | 'parent' | 'student' | 'unknown';

export interface NormalUserContext {
  type: 'normal';
  userId: string;
  organizationId: string;
  branchId: string;
  branchName: string;
  role: UserRole;
}

export interface SuperAdminContext {
  type: 'superadmin';
  userId: string;
  organizationId: string;
  role: 'superadmin';
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
    const { data: orgMembership } = await supabase
      .from('organization_memberships')
      .select('organization_id')
      .eq('user_id', user.user.id)
      .maybeSingle();

    if (orgMembership) {
      return {
        type: 'superadmin',
        userId: user.user.id,
        organizationId: orgMembership.organization_id,
        role: 'superadmin'
      };
    }
    return null;
  }

  const { data: memberships, error: membershipError } = await supabase
    .from('branch_memberships')
    .select('branch_id, branches(name, organization_id), role')
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

  return {
    type: 'normal',
    userId: user.user.id,
    organizationId: branchData.organization_id,
    branchId: memberships[0].branch_id,
    branchName: branchData.name || 'Unknown Branch',
    role: (memberships[0].role as UserRole) || 'unknown'
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
