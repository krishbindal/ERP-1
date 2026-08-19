const fs = require('fs');

function replaceInFile(path, replacements) {
    let content = fs.readFileSync(path, 'utf8');
    for (const {from, to} of replacements) {
        content = content.replace(from, to);
    }
    fs.writeFileSync(path, content);
}

// 1. academic-structure/actions.ts
replaceInFile('apps/web/src/app/academic-structure/actions.ts', [
    { from: "branch.organization_id !== context.organizationId", to: "!auth_has_org_access(context, branch.organization_id)" },
    { from: "catch (e: unknown)", to: "catch (e: any)" },
    { from: "import { createClient } from '@/lib/supabase/server';", to: "import { createClient } from '@/lib/supabase/server';\nimport { auth_has_org_access } from '@/lib/branch-context';" }
]);

// 2. academic-structure/page.tsx
replaceInFile('apps/web/src/app/academic-structure/page.tsx', [
    { from: "branch.organization_id === context.organizationId", to: "auth_has_org_access(context, branch.organization_id)" },
    { from: "import { getAppContext } from '@/lib/branch-context';", to: "import { getAppContext, auth_has_org_access } from '@/lib/branch-context';" }
]);

// 3. app-config/actions.ts
replaceInFile('apps/web/src/app/admin/app-config/actions.ts', [
    { from: "branch.organization_id !== context.organizationId", to: "!auth_has_org_access(context, branch.organization_id)" },
    { from: "catch (e: unknown)", to: "catch (e: any)" },
    { from: "import { getAppContext } from '@/lib/branch-context';", to: "import { getAppContext, auth_has_org_access } from '@/lib/branch-context';" }
]);

// 4. app-config/page.tsx
replaceInFile('apps/web/src/app/admin/app-config/page.tsx', [
    { from: "branch.organization_id === context.organizationId", to: "auth_has_org_access(context, branch.organization_id)" },
    { from: "import { getAppContext } from '@/lib/branch-context';", to: "import { getAppContext, auth_has_org_access } from '@/lib/branch-context';" }
]);

// 5. TopBar.tsx
replaceInFile('apps/web/src/components/layout/TopBar.tsx', [
    { from: "context.organizationId", to: "context.organizationScopes[0]" }
]);

// 6. fix components missing explicitBranchId
const components = [
    'AcademicYearForm.tsx', 'AcademicYearsTable.tsx', 'ClassesTable.tsx', 'ClassForm.tsx', 'SectionForm.tsx', 'SectionsTable.tsx'
];
for (const comp of components) {
    const path = pps/web/src/app/academic-structure/components/\;
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace("explicitBranchId?: string", "explicitBranchId?: string | null");
    content = content.replace("explicitBranchId: any", "explicitBranchId?: string | null");
    fs.writeFileSync(path, content);
}

