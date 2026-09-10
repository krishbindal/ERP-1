import { useState, useMemo } from 'react';

export function useDataTable<T, SortField extends string>(
  data: T[],
  searchFn: (item: T, query: string) => boolean,
  sortFn: (a: T, b: T, field: SortField, order: 'asc' | 'desc') => number,
  initialSortField: SortField,
  pageSize: number = 10
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>(initialSortField);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return data.filter((item) => searchFn(item, query));
  }, [data, searchQuery, searchFn]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => sortFn(a, b, sortField, sortOrder));
  }, [filteredData, sortField, sortOrder, sortFn]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
    sortField,
    sortOrder,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
    handleSort,
    totalItems: sortedData.length,
    startIndex,
    pageSize,
    sortedData
  };
}
