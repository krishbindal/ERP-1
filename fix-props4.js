const fs = require('fs');

function replaceInFile(path, replacements) {
    let content = fs.readFileSync(path, 'utf8');
    for (const {from, to} of replacements) {
        content = content.split(from).join(to);
    }
    fs.writeFileSync(path, content);
}

replaceInFile('apps/web/src/app/academic-structure/components/ClassesTable.tsx', [
    { from: "{ data, isReadOnly }: { data: ClassWithYear[], isReadOnly: boolean , explicitBranchId?: string | null }", to: "{ data, isReadOnly, explicitBranchId }: { data: ClassWithYear[], isReadOnly: boolean, explicitBranchId?: string | null }" },
    { from: "explicitBranchId={explicitBranchId}", to: "explicitBranchId={explicitBranchId || undefined}" },
    { from: "explicitBranchId)", to: "explicitBranchId || undefined)" }
]);

replaceInFile('apps/web/src/app/academic-structure/components/SectionsTable.tsx', [
    { from: "{ data, isReadOnly }: { data: SectionWithClass[], isReadOnly: boolean , explicitBranchId?: string | null }", to: "{ data, isReadOnly, explicitBranchId }: { data: SectionWithClass[], isReadOnly: boolean, explicitBranchId?: string | null }" },
    { from: "explicitBranchId={explicitBranchId}", to: "explicitBranchId={explicitBranchId || undefined}" },
    { from: "explicitBranchId)", to: "explicitBranchId || undefined)" }
]);

replaceInFile('apps/web/src/app/academic-structure/components/AcademicYearsTable.tsx', [
    { from: "explicitBranchId={explicitBranchId}", to: "explicitBranchId={explicitBranchId || undefined}" },
    { from: "explicitBranchId)", to: "explicitBranchId || undefined)" }
]);

replaceInFile('apps/web/src/app/academic-structure/components/AcademicYearForm.tsx', [
    { from: "explicitBranchId)", to: "explicitBranchId || undefined)" }
]);
replaceInFile('apps/web/src/app/academic-structure/components/ClassForm.tsx', [
    { from: "explicitBranchId)", to: "explicitBranchId || undefined)" }
]);
replaceInFile('apps/web/src/app/academic-structure/components/SectionForm.tsx', [
    { from: "explicitBranchId)", to: "explicitBranchId || undefined)" }
]);

