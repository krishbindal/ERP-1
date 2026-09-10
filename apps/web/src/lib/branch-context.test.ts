import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as serverSupabase from './supabase/server';
import { getAppContext, verifyPageBranchContext, auth_is_super_admin } from './branch-context';

vi.mock('./supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('branch-context - context resolution and memoization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves normal user context with branch and roles', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          app_metadata: { is_super_admin: false },
        },
      },
      error: null,
    });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'branch_memberships') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                {
                  branch_id: 'branch-abc',
                  branches: { name: 'Main Campus', organization_id: 'org-xyz' },
                  user_role_assignments: [
                    { roles: { name: 'branchadmin' } },
                  ],
                },
              ],
              error: null,
            }),
          }),
        };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [], error: null }) };
    });

    // @ts-expect-error test mock override
    serverSupabase.createClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    });

    const context = await getAppContext();
    expect(context).not.toBeNull();
    expect(context?.type).toBe('normal');
    if (context?.type === 'normal') {
      expect(context.branchId).toBe('branch-abc');
      expect(context.organizationId).toBe('org-xyz');
      expect(context.branchName).toBe('Main Campus');
      expect(context.roles).toEqual(['branchadmin']);
      expect(auth_is_super_admin(context)).toBe(false);
    }
  });

  it('resolves superadmin context when is_super_admin flag is set', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: 'super-123',
          app_metadata: { is_super_admin: true },
        },
      },
      error: null,
    });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'organization_memberships') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                { organization_id: 'org-1' },
                { organization_id: 'org-2' },
              ],
              error: null,
            }),
          }),
        };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [], error: null }) };
    });

    // @ts-expect-error test mock override
    serverSupabase.createClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    });

    const context = await getAppContext();
    expect(context).not.toBeNull();
    expect(context?.type).toBe('superadmin');
    if (context?.type === 'superadmin') {
      expect(context.userId).toBe('super-123');
      expect(context.organizationScopes).toEqual(['org-1', 'org-2']);
      expect(context.roles).toEqual(['superadmin']);
      expect(auth_is_super_admin(context)).toBe(true);
    }
  });

  it('returns null when user is unauthenticated', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    // @ts-expect-error test mock override
    serverSupabase.createClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
    });

    const context = await getAppContext();
    expect(context).toBeNull();
  });

  it('verifies page branch context accurately for normal users', async () => {
    const mockGetUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          app_metadata: { is_super_admin: false },
        },
      },
      error: null,
    });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'branch_memberships') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                {
                  branch_id: 'branch-abc',
                  branches: { name: 'Main Campus', organization_id: 'org-xyz' },
                  user_role_assignments: [
                    { roles: { name: 'branchadmin' } },
                  ],
                },
              ],
              error: null,
            }),
          }),
        };
      }
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: [], error: null }) };
    });

    // @ts-expect-error test mock override
    serverSupabase.createClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    });

    const result = await verifyPageBranchContext(undefined);
    expect(result.isAuthorized).toBe(true);
    expect(result.branchId).toBe('branch-abc');
    expect(result.isReadOnly).toBe(false);
    expect(result.errorState).toBeNull();
  });
});
