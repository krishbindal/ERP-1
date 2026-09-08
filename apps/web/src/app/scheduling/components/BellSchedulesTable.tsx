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
import { BellScheduleForm } from './BellScheduleForm';
import { deleteBellSchedule } from '../actions';
import { BellSchedule } from './types';

export interface BellSchedulesTableProps {
  data: BellSchedule[];
  isReadOnly: boolean;
  explicitBranchId?: string | null;
}

type SortField = 'name' | 'status';
type SortOrder = 'asc' | 'desc';

export function BellSchedulesTable({ data, isReadOnly, explicitBranchId }: BellSchedulesTableProps) {
  const router = useRouter();
  

  // Drawer / modal states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BellSchedule | null>(null);

  // ConfirmDialog states
  const [scheduleToDelete, setScheduleToDelete] = useState<BellSchedule | null>(null);
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
    (schedule: any, query: string) => {
      const nameMatch = schedule.name?.toLowerCase().includes(query);
      const statusMatch = schedule.status?.toLowerCase().includes(query);
      return nameMatch || statusMatch;
    },
    (a: any, b: any, sortField: any, sortOrder: any) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
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

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      setIsDeleting(true);
      const result = await deleteBellSchedule(scheduleToDelete.id, explicitBranchId || undefined);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Bell schedule "${scheduleToDelete.name}" deleted successfully.`);
        setScheduleToDelete(null);
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
          <h2 className="text-lg font-semibold text-foreground">Bell Schedules</h2>
          <p className="text-xs text-muted-foreground">Configure bell schedules and daily time structures.</p>
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
            Create Bell Schedule
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Input
            id="bell-schedule-search"
            type="search"
            aria-label="Search bell schedules"
            placeholder="Search bell schedules..."
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
              ? '0 bell schedules'
              : `Showing ${startIndex + 1}-${Math.min(startIndex + pageSize, sortedItems.length)} of ${sortedItems.length} bell schedules`}
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
              colSpan={isReadOnly ? 2 : 3}
              title={searchQuery ? 'No matching bell schedules found' : 'No bell schedules configured'}
              description={
                searchQuery
                  ? `No bell schedules matched your query "${searchQuery}". Try a different keyword.`
                  : 'Get started by creating your first bell schedule.'
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
                    Create Bell Schedule
                  </Button>
                ) : undefined
              }
            />
          ) : (
            paginatedItems.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className="font-medium text-foreground">{schedule.name}</TableCell>
                <TableCell>
                  <Badge variant={schedule.status === 'active' ? 'success' : 'default'}>
                    {schedule.status}
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
                          setEditingItem(schedule);
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
                        onClick={() => setScheduleToDelete(schedule)}
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
        <BellScheduleForm
          onClose={() => setIsDrawerOpen(false)}
          initialData={editingItem}
          explicitBranchId={explicitBranchId || undefined}
        />
      )}

      {/* Canonical ConfirmDialog: Delete Bell Schedule */}
      <ConfirmDialog
        isOpen={!!scheduleToDelete}
        onClose={() => {
          if (!isDeleting) setScheduleToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Bell Schedule"
        message={`Are you sure you want to delete bell schedule "${scheduleToDelete?.name}"? Associated periods and timetable entries may be affected. This action cannot be undone.`}
        confirmText="Delete Bell Schedule"
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
        message="Are you sure you want to clear your search input and return to the complete bell schedules view?"
        confirmText="Reset Filters"
        cancelText="Keep Search"
        isDestructive={false}
      />
    </div>
  );
}

// Alias export for backward compatibility
export const BellSchedulesList = BellSchedulesTable;
