import { AuthContextState } from '@schoolos/auth';

type PermissionAwareState = AuthContextState & { permissions?: readonly string[] };

/** Client-side permission hint only. Database/RPC authorization is authoritative. */
export const can = (permission: string, state: AuthContextState): boolean => {
  if (!permission) return false;
  if (state.isSuperAdmin) return true;
  const permissions = (state as PermissionAwareState).permissions;
  return Boolean(state.activeBranchId && permissions?.includes(permission));
};

export const canAccessOrganization = (orgId: string, state: AuthContextState): boolean => {
  if (!orgId) return false;
  if (state.isSuperAdmin) return true;
  return state.organizationMemberships.some(m => m.organizationId === orgId);
};

export const canAccessBranch = (branchId: string, state: AuthContextState): boolean => {
  if (!branchId) return false;
  if (state.isSuperAdmin) return true;
  return state.branchMemberships.some(m => m.branchId === branchId);
};

export const hasRole = (role: string, state: AuthContextState): boolean => {
  if (!role) return false;
  if (state.isSuperAdmin) return true;
  if (state.activeBranchId) {
    const membership = state.branchMemberships.find(m => m.branchId === state.activeBranchId);
    if (membership?.role === role) return true;
  }
  return false;
};
