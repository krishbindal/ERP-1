'use client';

import React, { useState, useMemo } from 'react';
import { useDataTable } from '@/hooks/useDataTable';
import Link from 'next/link';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, User } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyRow,
  Button,
  Input,
  Select,
  Badge,
} from '@/components/ui';

export interface StudentItem {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
}

export interface StudentsTableProps {
  students: StudentItem[];
}

type SortField = 'name' | 'status';
type SortOrder = 'asc' | 'desc';

export function StudentsTable({ students }: StudentsTableProps) {
  const [statusFilter, setStatusFilter] = useState('ALL');

    const {
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
    students,
    (student: any, query: string) => {
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
      const matchesSearch =
        !query.trim() ||
        fullName.includes(query.trim().toLowerCase()) ||
        student.id.toLowerCase().includes(query.trim().toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        student.status?.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    },
    (a: any, b: any, sortField: any, sortOrder: any) => {
      let comparison = 0;
      if (sortField === 'name') {
        const nameA = `${a.last_name}, ${a.first_name}`.toLowerCase();
        const nameB = `${b.last_name}, ${b.first_name}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    },
    'name' as SortField
  );

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground inline" aria-hidden="true" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-primary inline" aria-hidden="true" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-primary inline" aria-hidden="true" />
    );
  };

  const getAriaSort = (field: SortField) => {
    if (sortField !== field) return 'none';
    return sortOrder === 'asc' ? 'ascending' : 'descending';
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'destructive' | 'outline' | 'default' => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
      case 'WITHDRAWN':
      case 'SUSPENDED':
        return 'destructive';
      case 'PROBATION':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Input
              id="student-search"
              type="search"
              aria-label="Search students"
              placeholder="Search by name or admission number..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              leftAddon={<Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
            />
          </div>

          <div className="w-full sm:w-40">
            <Select
              id="student-status-filter"
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'WITHDRAWN', label: 'Withdrawn' },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {(searchQuery || statusFilter !== 'ALL') && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </Button>
          )}
          <span className="text-xs text-muted-foreground font-medium">
            {sortedItems.length === 0
              ? '0 students'
              : `Showing ${startIndex + 1}-${Math.min(startIndex + pageSize, sortedItems.length)} of ${sortedItems.length} students`}
          </span>
        </div>
      </div>

      {/* Canonical Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col" aria-sort={getAriaSort('name')}>
              <button
                type="button"
                onClick={() => handleSort('name')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Name (${sortField === 'name' ? sortOrder : 'none'})`}
              >
                Name {getSortIcon('name')}
              </button>
            </TableHead>
            <TableHead scope="col" aria-sort={getAriaSort('status')}>
              <button
                type="button"
                onClick={() => handleSort('status')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Status (${sortField === 'status' ? sortOrder : 'none'})`}
              >
                Status {getSortIcon('status')}
              </button>
            </TableHead>
            <TableHead scope="col" className="text-right">
              <span className="sr-only">Actions</span>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.length === 0 ? (
            <TableEmptyRow
              colSpan={3}
              icon={<User className="h-8 w-8 text-muted-foreground" aria-hidden="true" />}
              title={
                searchQuery || statusFilter !== 'ALL'
                  ? 'No matching students found'
                  : 'No students found'
              }
              description={
                searchQuery || statusFilter !== 'ALL'
                  ? 'No students matched your search and filter criteria. Try adjusting your filters.'
                  : 'No students found in your active branches.'
              }
              action={
                searchQuery || statusFilter !== 'ALL' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            paginatedItems.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium text-foreground">
                  {student.first_name} {student.last_name}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(student.status)}>
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/students/${student.id}`}
                    className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-sm font-medium text-primary hover:underline focus-ring rounded p-2"
                    aria-label={`View profile for ${student.first_name} ${student.last_name}`}
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


