const fs = require('fs');
const files = [
  'AcademicYearsTable.tsx', 'ClassesTable.tsx', 'SectionsTable.tsx',
  'ClassForm.tsx', 'SectionForm.tsx'
];
for(const f of files) {
  const p = 'apps/web/src/app/academic-structure/components/' + f;
  let text = fs.readFileSync(p, 'utf8');
  if(f.includes('Table')) {
    text = text.replace('export function ' + f.split('.')[0] + '({ data, isReadOnly }: { data: any[], isReadOnly: boolean }) {', 'export function ' + f.split('.')[0] + '({ data, isReadOnly, explicitBranchId }: { data: any[], isReadOnly: boolean, explicitBranchId?: string | null }) {');
  } else {
    // forms
    text = text.replace('explicitBranchId }: { onClose: () => void, initialData?: ', 'explicitBranchId }: { onClose: () => void, explicitBranchId?: string | null, initialData?: ');
  }
  fs.writeFileSync(p, text);
}
