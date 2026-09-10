const fs = require('fs');

const files = [
  'apps/web/src/app/academic-structure/calendar/components/CalendarEventsTable.tsx',
  'apps/web/src/app/academic-structure/components/AcademicYearsTable.tsx',
  'apps/web/src/app/academic-structure/components/ClassesList.tsx',
  'apps/web/src/app/academic-structure/components/SectionsList.tsx',
  'apps/web/src/app/attendance/history/components/AttendanceHistoryTable.tsx',
  'apps/web/src/app/scheduling/components/BellSchedulesTable.tsx',
  'apps/web/src/app/scheduling/components/PeriodsTable.tsx',
  'apps/web/src/app/scheduling/components/RoomsTable.tsx',
  'apps/web/src/app/students/components/StudentsTable.tsx'
];

let replaced = 0;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace imports
  if (!content.includes('useDataTable')) {
    content = content.replace(/(import React.*?from 'react';)/, "$1\nimport { useDataTable } from '@/hooks/useDataTable';");
  }

  // Find array name (data, students, records, events)
  let arrayName = 'data';
  if (file.includes('StudentsTable')) arrayName = 'students';
  if (file.includes('CalendarEvents')) arrayName = 'events';
  if (file.includes('AttendanceHistory')) arrayName = 'records';

  // Fix generic names used in rendering BEFORE we insert the hook
  // We'll replace sortedData -> sortedItems, etc.
  content = content.replace(/sortedData/g, `sortedItems`);
  content = content.replace(/paginatedData/g, `paginatedItems`);
  content = content.replace(/sortedStudents/g, `sortedItems`);
  content = content.replace(/paginatedStudents/g, `paginatedItems`);
  content = content.replace(/sortedRecords/g, `sortedItems`);
  content = content.replace(/paginatedRecords/g, `paginatedItems`);
  content = content.replace(/sortedEvents/g, `sortedItems`);
  content = content.replace(/filteredEvents/g, `filteredItems`);
  content = content.replace(/validCurrentPage/g, 'currentPage');

  // Find the block
  const blockRegex = /\/\/\s*(?:Filter|Filtering|Search & Sorting & Pagination)[\s\S]*?setCurrentPage\(1\);\r?\n\s*};/m;
  const match = content.match(blockRegex);
  
  if (match) {
    const filterRegex = /return [a-zA-Z0-9_]+\.filter\(\(([a-zA-Z0-9_]+)\) => {\s*([\s\S]*?)\s*}\);/;
    const filterMatch = match[0].match(filterRegex);
    const sortRegex = /return \[\.\.\.[a-zA-Z0-9_]+\]\.sort\(\(a, b\) => {\s*([\s\S]*?)\s*}\);/;
    const sortMatch = match[0].match(sortRegex);

    if (filterMatch && sortMatch) {
      const paramName = filterMatch[1];
      const filterBody = filterMatch[2];
      const sortBody = sortMatch[1];
      
      const initialSortMatch = content.match(/useState<SortField>\('([^']+)'\)/);
      const initialSort = initialSortMatch ? initialSortMatch[1] : 'name';
      
      const replacement = `  const {
    searchQuery,
    setSearchQuery,
    sortField,
    sortOrder,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedItems,
    handleSort,
    totalItems,
    startIndex,
    pageSize,
    sortedData: sortedItems
  } = useDataTable<any, SortField>(
    ${arrayName},
    (${paramName}: any, query: string) => {
      ${filterBody}
    },
    (a: any, b: any, sortField: any, sortOrder: any) => {
      ${sortBody}
    },
    '${initialSort}' as SortField
  );`;

      content = content.replace(blockRegex, replacement);
      
      // Remove states
      const stateRegex = /const \[searchQuery, setSearchQuery\] = useState\(''\);\r?\n\s*const \[sortField, setSortField\] = useState<SortField>\([^)]+\);\r?\n\s*const \[sortOrder, setSortOrder\] = useState<SortOrder>\('asc'\);\r?\n\s*const \[currentPage, setCurrentPage\] = useState\(1\);\r?\n\s*const pageSize = 10;/g;
      content = content.replace(stateRegex, '');
      
      fs.writeFileSync(file, content);
      replaced++;
      console.log('Replaced in', file);
    }
  }
}
console.log('Done, replaced:', replaced);
