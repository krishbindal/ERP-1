const fs = require('fs');

let content = fs.readFileSync('apps/web/src/lib/branch-context.ts', 'utf8');

// 1. Add auth_is_super_admin
if (!content.includes('auth_is_super_admin')) {
    content = content.replace('export function auth_has_org_access', 'export function auth_is_super_admin(context: AppContext | null): boolean {\n  return context?.type === \\'superadmin\\';\n}\n\nexport function auth_has_org_access');
}

// 2. Fix auth_has_branch_membership
const oldMembership = export function auth_has_branch_membership(context: AppContext | null, branch: { id: string, organization_id: string }): boolean {
  if (!context) return false;
  if (context.type === 'superadmin') {
    return context.organizationScopes.includes(branch.organization_id);
  }
  return context.branchId === branch.id;
};
const newMembership = export function auth_has_branch_membership(context: AppContext | null, branch: { id: string, organization_id: string }): boolean {
  if (!context) return false;
  if (context.type === 'superadmin') {
    return context.organizationScopes.includes(branch.organization_id);
  }
  return context.branchId === branch.id && context.organizationId === branch.organization_id;
};
content = content.replace(oldMembership, newMembership);

// 3. Fix auth_has_branch_role
const oldRole = export function auth_has_branch_role(context: AppContext | null, branch: { id: string, organization_id: string }, roleName: UserRole): boolean {
  if (!context) return false;
  if (context.type === 'superadmin') {
    return context.organizationScopes.includes(branch.organization_id);
  }
  return context.branchId === branch.id && context.roles.includes(roleName);
};
const newRole = export function auth_has_branch_role(context: AppContext | null, branch: { id: string, organization_id: string }, roleName: UserRole): boolean {
  if (!context) return false;
  
  if (context.type === 'superadmin') {
    return context.organizationScopes.includes(branch.organization_id) && context.roles.includes(roleName);
  }

  return context.branchId === branch.id && 
         context.organizationId === branch.organization_id && 
         context.roles.includes(roleName);
};
content = content.replace(oldRole, newRole);

fs.writeFileSync('apps/web/src/lib/branch-context.ts', content);

// Now update the spec
let specContent = fs.readFileSync('apps/web/e2e/branch-context.spec.ts', 'utf8');

if (!specContent.includes('auth_is_super_admin')) {
    specContent = specContent.replace('auth_has_branch_role,', 'auth_has_branch_role,\n  auth_is_super_admin,\n  auth_has_org_access,');
}

// Update tests
const tests = 
test.describe('branch-context authorization helpers', () => {
  const superAdminContext: SuperAdminContext = {
    type: 'superadmin',
    userId: 'sa-123',
    organizationScopes: ['org-1', 'org-2'],
    roles: [],
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

  test.describe('auth_is_super_admin', () => {
    test('is true for super admin', () => {
      expect(auth_is_super_admin(superAdminContext)).toBe(true);
    });
    test('is false for normal users', () => {
      expect(auth_is_super_admin(branchAdminContext)).toBe(false);
      expect(auth_is_super_admin(teacherContext)).toBe(false);
    });
  });

  test.describe('auth_has_org_access', () => {
    test('Super Admin has access to authorized orgs', () => {
      expect(auth_has_org_access(superAdminContext, 'org-1')).toBe(true);
      expect(auth_has_org_access(superAdminContext, 'org-3')).toBe(false);
    });
    test('Normal user has access to their own org', () => {
      expect(auth_has_org_access(branchAdminContext, 'org-1')).toBe(true);
      expect(auth_has_org_access(branchAdminContext, 'org-2')).toBe(false);
    });
  });

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

    test.describe('Normal User', () => {
      test('allows access to their own branch and org', () => {
        expect(auth_has_branch_membership(branchAdminContext, { id: 'branch-1', organization_id: 'org-1' })).toBe(true);
      });

      test('denies access to a different branch', () => {
        expect(auth_has_branch_membership(branchAdminContext, { id: 'branch-2', organization_id: 'org-1' })).toBe(false);
      });

      test('denies access to a different org', () => {
        expect(auth_has_branch_membership(branchAdminContext, { id: 'branch-1', organization_id: 'org-2' })).toBe(false);
      });
    });
  });

  test.describe('auth_has_branch_role', () => {
    test.describe('Super Admin', () => {
      test('does NOT blindly return true for any role', () => {
        expect(auth_has_branch_role(superAdminContext, { id: 'branch-1', organization_id: 'org-1' }, 'branchadmin')).toBe(false);
        expect(auth_has_branch_role(superAdminContext, { id: 'branch-1', organization_id: 'org-1' }, 'teacher')).toBe(false);
      });

      test('returns true if superadmin explicitly has the role', () => {
        const saWithRole: SuperAdminContext = { ...superAdminContext, roles: ['branchadmin'] };
        expect(auth_has_branch_role(saWithRole, { id: 'branch-1', organization_id: 'org-1' }, 'branchadmin')).toBe(true);
      });
    });

    test.describe('Branch Admin', () => {
      test('has correct role in own branch and org', () => {
        expect(auth_has_branch_role(branchAdminContext, { id: 'branch-1', organization_id: 'org-1' }, 'branchadmin')).toBe(true);
      });

      test('does not have other roles', () => {
        expect(auth_has_branch_role(branchAdminContext, { id: 'branch-1', organization_id: 'org-1' }, 'teacher')).toBe(false);
      });

      test('denies role in other branch', () => {
        expect(auth_has_branch_role(branchAdminContext, { id: 'branch-2', organization_id: 'org-1' }, 'branchadmin')).toBe(false);
      });
      
      test('denies role in other org', () => {
        expect(auth_has_branch_role(branchAdminContext, { id: 'branch-1', organization_id: 'org-2' }, 'branchadmin')).toBe(false);
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
;
const oldTests = specContent.substring(specContent.indexOf("test.describe('branch-context authorization helpers', () => {"));
specContent = specContent.replace(oldTests, tests);
fs.writeFileSync('apps/web/e2e/branch-context.spec.ts', specContent);
