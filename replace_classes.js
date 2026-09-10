const fs = require('fs');
const file = 'apps/web/src/app/academic-structure/components/ClassesList.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useDataTable')) {
  content = content.replace(/(import React.*?from 'react';)/, "$1\nimport { useDataTable } from '@/hooks/useDataTable';");
}

content = content.replace(/const \[searchQuery, setSearchQuery\] = useState\(''\);\r?\n\s*const \[sortField, setSortField\] = useState<SortField>\([^)]+\);\r?\n\s*const \[sortOrder, setSortOrder\] = useState<SortOrder>\('asc'\);\r?\n\s*const \[currentPage, setCurrentPage\] = useState\(1\);\r?\n\s*const pageSize = 10;/, '');

const blockRegex = /\/\/ Filtering[\s\S]*?setCurrentPage\(1\);\r?\n\s*};/m;
const match = content.match(blockRegex);
if (match) {
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
    (cls, query) => {
      const nameMatch = cls.name?.toLowerCase().includes(query);
      const yearMatch = cls.academic_years?.name?.toLowerCase().includes(query);
      const levelMatch = cls.level?.toString().includes(query);
      return nameMatch || yearMatch || levelMatch;
    },
    (a, b, sortField, sortOrder) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'academic_year') {
        const yearA = a.academic_years?.name || '';
        const yearB = b.academic_years?.name || '';
        comparison = yearA.localeCompare(yearB);
      } else if (sortField === 'level') {
        comparison = (a.level ?? 0) - (b.level ?? 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    },
    'name'
  );`;
  content = content.replace(blockRegex, replacement);
  fs.writeFileSync(file, content);
  console.log('Replaced ClassesList.tsx');
} else { console.log('not found'); }
