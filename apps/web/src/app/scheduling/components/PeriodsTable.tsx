"use client";

import React, { useState, useMemo } from 'react';
import { useDataTable } from '@/hooks/useDataTable';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Plus, RotateCcw } from 'lucide-react';
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
  Badge,
  ConfirmDialog,
  toast,
} from '@/components/ui';
import { PeriodForm } from './PeriodForm';
import { deletePeriod } from '../actions';
import { Period, BellSchedule } from './types';

export interface PeriodsTableProps {
  data: Period[];
  schedules: BellSchedule[];
  isReadOnly: boolean;
  explicitBranchId?: string | null;
}

type SortField = 'name' | 'bell_schedule' | 'start_time' | 'end_time' | 'status';
type SortOrder = 'asc' | 'desc';

export function PeriodsTable({ data, schedules, isReadOnly, explicitBranchId }: PeriodsTableProps) {
  const router = useRouter();
  

  // Drawer / modal states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Period | null>(null);

  // ConfirmDialog states
  const [periodToDelete, setPeriodToDelete] = useState<Period | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetFiltersConfirmOpen, setResetFiltersConfirmOpen] = useState(false);

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
    data,
    (period: any, query: string) => {
      const nameMatch = period.name?.toLowerCase().includes(query);
      const scheduleMatch = period.bell_schedules?.name?.toLowerCase().includes(query);
      const startMatch = period.start_time?.toLowerCase().includes(query);
      const endMatch = period.end_time?.toLowerCase().includes(query);
      const statusMatch = period.status?.toLowerCase().includes(query);
      return nameMatch || scheduleMatch || startMatch || endMatch || statusMatch;
    },
    (a: any, b: any, sortField: any, sortOrder: any) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'bell_schedule') {
        const schedA = a.bell_schedules?.name || '';
        const schedB = b.bell_schedules?.name || '';
        comparison = schedA.localeCompare(schedB);
      } else if (sortField === 'start_time') {
        comparison = (a.start_time || '').localeCompare(b.start_time || '');
      } else if (sortField === 'end_time') {
        comparison = (a.end_time || '').localeCompare(b.end_time || '');
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    },
    'start_time' as SortField
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

  const confirmDelete = async () => {
    if (!periodToDelete) return;

    try {
      setIsDeleting(true);
      const result = await deletePeriod(periodToDelete.id, explicitBranchId || undefined);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Period "${periodToDelete.name}" deleted successfully.`);
        setPeriodToDelete(null);
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('An unexpected error occurred during deletion.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmResetFilters = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setResetFiltersConfirmOpen(false);
    toast.info('Search filters reset.');
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Periods</h2>
          <p className="text-xs text-muted-foreground">Manage class periods, instructional intervals, and passing times.</p>
        </div>
        {!isReadOnly && (
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setEditingItem(null);
              setIsDrawerOpen(true);
            }}
            className="flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Period
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Input
            id="period-search"
            type="search"
            aria-label="Search periods"
            placeholder="Search periods..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            leftAddon={<Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setResetFiltersConfirmOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" aria-hidden="true" />
              Reset Filters
            </Button>
          )}
          <span className="text-xs text-muted-foreground font-medium">
            {sortedItems.length === 0
              ? '0 periods'
              : `Showing ${startIndex + 1}-${Math.min(startIndex + pageSize, sortedItems.length)} of ${sortedItems.length} periods`}
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
            <TableHead scope="col" aria-sort={getAriaSort('bell_schedule')}>
              <button
                type="button"
                onClick={() => handleSort('bell_schedule')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Bell Schedule (${sortField === 'bell_schedule' ? sortOrder : 'none'})`}
              >
                Bell Schedule {getSortIcon('bell_schedule')}
              </button>
            </TableHead>
            <TableHead scope="col" aria-sort={getAriaSort('start_time')}>
              <button
                type="button"
                onClick={() => handleSort('start_time')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Start Time (${sortField === 'start_time' ? sortOrder : 'none'})`}
              >
                Start Time {getSortIcon('start_time')}
              </button>
            </TableHead>
            <TableHead scope="col" aria-sort={getAriaSort('end_time')}>
              <button
                type="button"
                onClick={() => handleSort('end_time')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by End Time (${sortField === 'end_time' ? sortOrder : 'none'})`}
              >
                End Time {getSortIcon('end_time')}
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
            {!isReadOnly && (
              <TableHead scope="col" className="text-right">
                <span className="sr-only">Actions</span>
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.length === 0 ? (
            <TableEmptyRow
              colSpan={isReadOnly ? 5 : 6}
              title={searchQuery ? 'No matching periods found' : 'No periods configured'}
              description={
                searchQuery
                  ? `No periods matched your query "${searchQuery}". Try a different keyword.`
                  : 'Get started by creating your first bell schedule period.'
              }
              action={
                searchQuery ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Filter
                  </Button>
                ) : !isReadOnly ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingItem(null);
                      setIsDrawerOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                    Create Period
                  </Button>
                ) : undefined
              }
            />
          ) : (
            paginatedItems.map((period) => (
              <TableRow key={period.id}>
                <TableCell className="font-medium text-foreground">{period.name}</TableCell>
                <TableCell className="text-muted-foreground">{period.bell_schedules?.name || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{period.start_time}</TableCell>
                <TableCell className="text-muted-foreground">{period.end_time}</TableCell>
                <TableCell>
                  <Badge variant={period.status === 'active' ? 'success' : 'default'}>
                    {period.status}
                  </Badge>
                </TableCell>
                {!isReadOnly && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingItem(period);
                          setIsDrawerOpen(true);
                        }}
                        className="text-primary hover:text-primary hover:bg-primary/10"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPeriodToDelete(period)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                )}
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

      {/* Drawer Form for Edit/Create */}
      {isDrawerOpen && (
        <PeriodForm
          onClose={() => setIsDrawerOpen(false)}
          initialData={editingItem}
          schedules={schedules}
          explicitBranchId={explicitBranchId || undefined}
        />
      )}

      {/* Canonical ConfirmDialog: Delete Period */}
      <ConfirmDialog
        isOpen={!!periodToDelete}
        onClose={() => {
          if (!isDeleting) setPeriodToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Period"
        message={`Are you sure you want to delete period "${periodToDelete?.name}" (${periodToDelete?.start_time} - ${periodToDelete?.end_time})? Associated timetable slots may be affected. This action cannot be undone.`}
        confirmText="Delete Period"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />

      {/* Canonical ConfirmDialog: Reset Filters */}
      <ConfirmDialog
        isOpen={resetFiltersConfirmOpen}
        onClose={() => setResetFiltersConfirmOpen(false)}
        onConfirm={confirmResetFilters}
        title="Reset Search Filters"
        message="Are you sure you want to clear your search input and return to the complete periods view?"
        confirmText="Reset Filters"
        cancelText="Keep Search"
        isDestructive={false}
      />
    </div>
  );
}

// Alias export for backward compatibility
export const PeriodsList = PeriodsTable;
