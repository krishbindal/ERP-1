import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  fullName: string;
}

export interface OrganizationMembership {
  organizationId: string;
  role: string;
}

export interface BranchMembership {
  branchId: string;
  organizationId: string;
  role: string;
}

export interface AuthContextState {
  user: User | null;
  profile: Profile | null;
  organizationMemberships: OrganizationMembership[];
  branchMemberships: BranchMembership[];
  activeOrganizationId: string | null;
  activeBranchId: string | null;
  isSuperAdmin: boolean;
  isLoading: boolean;
}

export const createInitialState = (): AuthContextState => ({
  user: null,
  profile: null,
  organizationMemberships: [],
  branchMemberships: [],
  activeOrganizationId: null,
  activeBranchId: null,
  isSuperAdmin: false,
  isLoading: true,
});
