import { test, expect } from '@playwright/test';
import { 
  auth_has_branch_membership, 
  auth_has_branch_role,
  auth_is_super_admin,
  auth_has_org_access,
  NormalUserContext,
  SuperAdminContext,
  UserRole
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

  test.describe('Super Admin Semantics', () => {
    test('auth_is_super_admin() is true', () => {
      expect(auth_is_super_admin(superAdminContext)).toBe(true);
      expect(auth_is_super_admin(branchAdminContext)).toBe(false);
    });

    test('auth_has_org_access() is true for authorized org', () => {
      expect(auth_has_org_access(superAdminContext, 'org-1')).toBe(true);
      expect(auth_has_org_access(superAdminContext, 'org-3')).toBe(false);
    });

    test('auth_has_branch_membership() is true for branch in authorized org', () => {
      expect(auth_has_branch_membership(superAdminContext, { id: 'branch-1', organization_id: 'org-1' })).toBe(true);
    });

    test('auth_has_branch_membership() is false for branch in unauthorized org', () => {
      expect(auth_has_branch_membership(superAdminContext, { id: 'branch-3', organization_id: 'org-3' })).toBe(false);
    });

    test('auth_has_branch_role() is false unless an explicit real role assignment exists', () => {
      expect(auth_has_branch_role(superAdminContext, { id: 'branch-1', organization_id: 'org-1' }, 'branchadmin')).toBe(false);
      expect(auth_has_branch_role(superAdminContext, { id: 'branch-1', organization_id: 'org-1' }, 'teacher')).toBe(false);

      // Verify that if a real role assignment were added, it works
      const saWithExplicitRole = { ...superAdminContext, roles: ['superadmin', 'branchadmin'] as UserRole[] };
      expect(auth_has_branch_role(saWithExplicitRole, { id: 'branch-1', organization_id: 'org-1' }, 'branchadmin')).toBe(true);
    });
  });

  test.describe('Branch Admin Semantics', () => {
    test('branchadmin role is true for own branch', () => {
      expect(auth_has_branch_role(branchAdminContext, { id: 'branch-1', organization_id: 'org-1' }, 'branchadmin')).toBe(true);
    });

    test('teacher role is false unless explicitly assigned', () => {
      expect(auth_has_branch_role(branchAdminContext, { id: 'branch-1', organization_id: 'org-1' }, 'teacher')).toBe(false);
    });

    test('other branch is false', () => {
      expect(auth_has_branch_role(branchAdminContext, { id: 'branch-2', organization_id: 'org-1' }, 'branchadmin')).toBe(false);
    });

    test('wrong org is false', () => {
      expect(auth_has_branch_role(branchAdminContext, { id: 'branch-1', organization_id: 'org-2' }, 'branchadmin')).toBe(false);
    });
  });

  test.describe('Teacher Semantics', () => {
    test('teacher role is true in own branch', () => {
      expect(auth_has_branch_role(teacherContext, { id: 'branch-1', organization_id: 'org-1' }, 'teacher')).toBe(true);
    });

    test('branchadmin role is false', () => {
      expect(auth_has_branch_role(teacherContext, { id: 'branch-1', organization_id: 'org-1' }, 'branchadmin')).toBe(false);
    });

    test('other branch is false', () => {
      expect(auth_has_branch_role(teacherContext, { id: 'branch-2', organization_id: 'org-1' }, 'teacher')).toBe(false);
    });

    test('wrong org is false', () => {
      expect(auth_has_branch_role(teacherContext, { id: 'branch-1', organization_id: 'org-2' }, 'teacher')).toBe(false);
    });
  });
});
