const fs = require('fs');

const files = [
  'apps/web/src/app/academic-structure/calendar/components/CalendarEventsTable.tsx',
  'apps/web/src/app/academic-structure/components/AcademicYearsTable.tsx',
  'apps/web/src/app/academic-structure/components/ClassesList.tsx',
  'apps/web/src/app/academic-structure/components/SectionsList.tsx',
  'apps/web/src/app/attendance/components/AttendanceManager.tsx',
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

  const regex = /const \[searchQuery, setSearchQuery\] = useState\(''\);[\s\S]*?setCurrentPage\(1\);\n\s*};/m;
  const match = content.match(regex);
  if (match) {
    const filterRegex = /return [a-zA-Z0-9_]+\.filter\(\([a-zA-Z0-9_]+\) => {\s*([\s\S]*?)\s*}\);/;
    const filterMatch = match[0].match(filterRegex);
    const sortRegex = /return \[\.\.\.filteredData\]\.sort\(\(a, b\) => {\s*([\s\S]*?)\s*}\);/;
    const sortMatch = match[0].match(sortRegex);

    if (filterMatch && sortMatch) {
      const paramNameMatch = match[0].match(/return [a-zA-Z0-9_]+\.filter\(\(([a-zA-Z0-9_]+)\) => {/);
      const paramName = paramNameMatch ? paramNameMatch[1] : 'item';
      const filterBody = filterMatch[1];
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
    paginatedData,
    handleSort
  } = useDataTable(
    data,
    (${paramName}, query) => {
      ${filterBody}
    },
    (a, b, sortField, sortOrder) => {
      ${sortBody}
    },
    '${initialSort}'
  );`;

      content = content.replace(regex, replacement);
      fs.writeFileSync(file, content);
      replaced++;
      console.log('Replaced in', file);
    } else {
      console.log('Could not extract bodies in', file);
    }
  } else {
    console.log('Could not find block in', file);
  }
}
console.log('Done, replaced:', replaced);
