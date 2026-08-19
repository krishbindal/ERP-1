import { test, expect } from '@playwright/test';
import { 
  auth_has_branch_membership, 
  auth_has_branch_role,
  NormalUserContext,
  SuperAdminContext
} from '../src/lib/branch-context';

test.describe('branch-context authorization helpers', () => {
  const superAdminContext: SuperAdminContext = {
    type: 'superadmin',
    userId: 'sa-123',
    organizationScopes: ['org-1', 'org-2'],
    roles: ['superadmin'],
  };

  const branchAdminContext: NormalUserContext = {
    type: 'normal',
    userId: 'ba-123',
    organizationId: 'org-1',
    branchId: 'branch-1',
    branchName: 'Branch 1',
    roles: ['branchadmin'],
  };

  const teacherContext: NormalUserContext = {
    type: 'normal',
    userId: 't-123',
    organizationId: 'org-1',
    branchId: 'branch-1',
    branchName: 'Branch 1',
    roles: ['teacher'],
  };

  test.describe('auth_has_branch_membership', () => {
    test.describe('Super Admin', () => {
      test('allows access to a branch if the branch belongs to an authorized organization', () => {
        expect(auth_has_branch_membership(superAdminContext, { id: 'branch-1', organization_id: 'org-1' })).toBe(true);
        expect(auth_has_branch_membership(superAdminContext, { id: 'branch-x', organization_id: 'org-2' })).toBe(true);
      });

      test('denies access to a branch if the branch belongs to an unauthorized organization', () => {
        expect(auth_has_branch_membership(superAdminContext, { id: 'branch-3', organization_id: 'org-3' })).toBe(false);
      });
    });

    test.describe('Normal User (Branch Admin)', () => {
      test('allows access to their own branch', () => {
        expect(auth_has_branch_membership(branchAdminContext, { id: 'branch-1', organization_id: 'org-1' })).toBe(true);
      });

      test('denies access to a different branch', () => {
        expect(auth_has_branch_membership(branchAdminContext, { id: 'branch-2', organization_id: 'org-1' })).toBe(false);
      });
    });
  });

  test.describe('auth_has_branch_role', () => {
    test.describe('Super Admin', () => {
      test('inherently has any role for branches in authorized organizations', () => {
        expect(auth_has_branch_role(superAdminContext, { id: 'branch-1', organization_id: 'org-1' }, 'branchadmin')).toBe(true);
        expect(auth_has_branch_role(superAdminContext, { id: 'branch-1', organization_id: 'org-1' }, 'teacher')).toBe(true);
      });

      test('denies any role for branches in unauthorized organizations', () => {
        expect(auth_has_branch_role(superAdminContext, { id: 'branch-3', organization_id: 'org-3' }, 'branchadmin')).toBe(false);
      });
    });

    test.describe('Branch Admin', () => {
      test('has correct role in own branch', () => {
        expect(auth_has_branch_role(branchAdminContext, { id: 'branch-1', organization_id: 'org-1' }, 'branchadmin')).toBe(true);
      });

      test('does not have other roles in own branch', () => {
        expect(auth_has_branch_role(branchAdminContext, { id: 'branch-1', organization_id: 'org-1' }, 'teacher')).toBe(false);
      });

      test('denies role in other branch', () => {
        expect(auth_has_branch_role(branchAdminContext, { id: 'branch-2', organization_id: 'org-1' }, 'branchadmin')).toBe(false);
      });
    });

    test.describe('Teacher', () => {
      test('branch membership alone does NOT provide Branch Admin authorization', () => {
        expect(auth_has_branch_role(teacherContext, { id: 'branch-1', organization_id: 'org-1' }, 'branchadmin')).toBe(false);
      });

      test('has teacher role in own branch', () => {
        expect(auth_has_branch_role(teacherContext, { id: 'branch-1', organization_id: 'org-1' }, 'teacher')).toBe(true);
      });
    });
  });
});
