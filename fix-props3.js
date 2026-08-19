const fs = require('fs');

function fixTable(path, typeName) {
  let text = fs.readFileSync(path, 'utf8');
  text = text.replace(
    new RegExp(\\({ data, isReadOnly }: { data: \\[\\], isReadOnly: boolean , explicitBranchId\\?: string \\| null }\\)),
    ({ data, isReadOnly, explicitBranchId }: { data: [], isReadOnly: boolean, explicitBranchId?: string | null })
  );
  text = text.split("explicitBranchId)").join("explicitBranchId || undefined)");
  text = text.split("explicitBranchId}").join("explicitBranchId: explicitBranchId || undefined}");
  // Fix the render form explicitBranchId prop assignment: explicitBranchId={explicitBranchId} -> explicitBranchId={explicitBranchId || undefined}
  text = text.split("explicitBranchId={explicitBranchId}").join("explicitBranchId={explicitBranchId || undefined}");
  fs.writeFileSync(path, text);
}

function fixForm(path) {
  let text = fs.readFileSync(path, 'utf8');
  text = text.split("explicitBranchId)").join("explicitBranchId || undefined)");
  fs.writeFileSync(path, text);
}

fixTable('apps/web/src/app/academic-structure/components/AcademicYearsTable.tsx', 'AcademicYear');
fixTable('apps/web/src/app/academic-structure/components/ClassesTable.tsx', 'ClassWithYear');
fixTable('apps/web/src/app/academic-structure/components/SectionsTable.tsx', 'SectionWithClass');

fixForm('apps/web/src/app/academic-structure/components/AcademicYearForm.tsx');
fixForm('apps/web/src/app/academic-structure/components/ClassForm.tsx');
fixForm('apps/web/src/app/academic-structure/components/SectionForm.tsx');
