const fs = require('fs');

function replaceInFile(path, replacements) {
    let content = fs.readFileSync(path, 'utf8');
    for (const {from, to} of replacements) {
        content = content.split(from).join(to);
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
    const path = 'apps/web/src/app/academic-structure/components/' + comp;
    let content = fs.readFileSync(path, 'utf8');
    content = content.split("explicitBranchId?: string").join("explicitBranchId?: string | null");
    content = content.split("explicitBranchId: any").join("explicitBranchId?: string | null");
    // Some components don't even have explicitBranchId in the type definition, let's just add it if missing.
    if (!content.includes("explicitBranchId")) {
        content = content.replace("onClose: () => void;", "onClose: () => void; explicitBranchId?: string | null;");
    }
    fs.writeFileSync(path, content);
}
