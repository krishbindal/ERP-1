import { AuthContextState } from '@schoolos/auth';

export const can = (permission: string, state: AuthContextState): boolean => {
  if (state.isSuperAdmin) return true;
  // Future: mapping of state.activeBranchId's role -> allowed permissions
  return false; 
};

export const canAccessOrganization = (orgId: string, state: AuthContextState): boolean => {
  if (state.isSuperAdmin) return true;
  return state.organizationMemberships.some(m => m.organizationId === orgId);
};

export const canAccessBranch = (branchId: string, state: AuthContextState): boolean => {
  if (state.isSuperAdmin) return true;
  return state.branchMemberships.some(m => m.branchId === branchId);
};

export const hasRole = (role: string, state: AuthContextState): boolean => {
  if (state.isSuperAdmin) return true;
  if (state.activeBranchId) {
     const membership = state.branchMemberships.find(m => m.branchId === state.activeBranchId);
     if (membership && membership.role === role) return true;
  }
  return false;
};
