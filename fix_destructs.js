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

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // If it's already using useDataTable, replace the destructured assignment to include the missing vars
  if (content.includes('useDataTable(')) {
    content = content.replace(/paginatedData,\s*handleSort\s*} = useDataTable\(/g, "paginatedData,\n    handleSort,\n    startIndex,\n    pageSize,\n    sortedData\n  } = useDataTable(");
    
    // Some components might have used `validCurrentPage`
    content = content.replace(/validCurrentPage/g, "currentPage");
    
    // For StudentsTable specifically, it had `sortedStudents` and `paginatedStudents`
    if (file.includes('StudentsTable.tsx')) {
        content = content.replace(/sortedData/g, "sortedStudents");
        content = content.replace(/paginatedData/g, "paginatedStudents");
        // Remove duplicated state declarations
        content = content.replace(/const \[searchQuery, setSearchQuery\] = useState\(''\);\r?\n\s*const \[sortField, setSortField\] = useState<SortField>\([^)]+\);\r?\n\s*const \[sortOrder, setSortOrder\] = useState<SortOrder>\('asc'\);\r?\n\s*const \[currentPage, setCurrentPage\] = useState\(1\);\r?\n\s*const pageSize = 10;/g, '');
    }

    fs.writeFileSync(file, content);
    console.log('Fixed destructs in', file);
  }
}
