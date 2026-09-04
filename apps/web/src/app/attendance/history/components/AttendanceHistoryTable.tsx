'use client';

import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
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

export interface AttendanceHistoryRecord {
  status: string;
  notes?: string | null;
  attendance_sessions: {
    date: string;
    published_at: string | null;
  };
  students: {
    first_name: string;
    last_name: string;
  };
}

export interface AttendanceHistoryTableProps {
  records: AttendanceHistoryRecord[];
}

type SortField = 'date' | 'name' | 'status';
type SortOrder = 'asc' | 'desc';

export function AttendanceHistoryTable({ records }: AttendanceHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtering
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const studentName = `${r.students.first_name} ${r.students.last_name}`.toLowerCase();
      const dateStr = r.attendance_sessions.date.toLowerCase();
      const notesStr = (r.notes || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch =
        !query ||
        studentName.includes(query) ||
        dateStr.includes(query) ||
        notesStr.includes(query);

      const matchesStatus =
        statusFilter === 'ALL' || r.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [records, searchQuery, statusFilter]);

  // Sorting
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.attendance_sessions.date.localeCompare(b.attendance_sessions.date);
      } else if (sortField === 'name') {
        const nameA = `${a.students.last_name}, ${a.students.first_name}`.toLowerCase();
        const nameB = `${b.students.last_name}, ${b.students.first_name}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredRecords, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedRecords = sortedRecords.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

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

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Input
              id="history-search"
              type="search"
              aria-label="Search attendance history"
              placeholder="Search by student name or date..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              leftAddon={<Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
            />
          </div>

          <div className="w-full sm:w-36">
            <Select
              id="history-status-filter"
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Incidents' },
                { value: 'ABSENT', label: 'Absent' },
                { value: 'LATE', label: 'Late' },
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
            {sortedRecords.length === 0
              ? '0 incidents'
              : `Showing ${startIndex + 1}-${Math.min(startIndex + pageSize, sortedRecords.length)} of ${sortedRecords.length} records`}
          </span>
        </div>
      </div>

      {/* Canonical Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col" aria-sort={getAriaSort('date')}>
              <button
                type="button"
                onClick={() => handleSort('date')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Date (${sortField === 'date' ? sortOrder : 'none'})`}
              >
                Date {getSortIcon('date')}
              </button>
            </TableHead>
            <TableHead scope="col" aria-sort={getAriaSort('name')}>
              <button
                type="button"
                onClick={() => handleSort('name')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Student Name (${sortField === 'name' ? sortOrder : 'none'})`}
              >
                Student {getSortIcon('name')}
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRecords.length === 0 ? (
            <TableEmptyRow
              colSpan={3}
              icon={<Calendar className="h-8 w-8 text-muted-foreground" aria-hidden="true" />}
              title={
                searchQuery || statusFilter !== 'ALL'
                  ? 'No matching attendance records'
                  : 'No published absences or lates'
              }
              description={
                searchQuery || statusFilter !== 'ALL'
                  ? 'No attendance records matched your filter criteria.'
                  : 'There are no published absence or late records on file for your account.'
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
            paginatedRecords.map((record, index) => (
              <TableRow key={`${record.attendance_sessions.date}-${index}`}>
                <TableCell className="font-mono text-xs text-foreground">
                  {record.attendance_sessions.date}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {record.students.first_name} {record.students.last_name}
                </TableCell>
                <TableCell>
                  <Badge variant={record.status === 'ABSENT' ? 'destructive' : 'warning'}>
                    {record.status}
                  </Badge>
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
            Page {validCurrentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage <= 1}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
