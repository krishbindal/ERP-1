"use client";

import React, { useState } from 'react';
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
import { AcademicYearForm } from './AcademicYearForm';
import { deleteAcademicYear } from '../actions';
import { AcademicYear } from './types';

export interface AcademicYearsTableProps {
  data: AcademicYear[];
  isReadOnly: boolean;
  explicitBranchId?: string | null;
}

type SortField = 'name' | 'start_date' | 'end_date' | 'status';
type SortOrder = 'asc' | 'desc';

export function AcademicYearsTable({ data, isReadOnly, explicitBranchId }: AcademicYearsTableProps) {
  const router = useRouter();
  

  // Drawer / modal states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicYear | null>(null);

  // ConfirmDialog states
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);
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
  } = useDataTable<AcademicYear, SortField>(
    data,
    (year: AcademicYear, query: string) => {
      const nameMatch = year.name?.toLowerCase().includes(query);
      const startMatch = year.start_date?.toLowerCase().includes(query);
      const endMatch = year.end_date?.toLowerCase().includes(query);
      const statusMatch = year.status?.toLowerCase().includes(query);
      return nameMatch || startMatch || endMatch || statusMatch;
    },
    (a: AcademicYear, b: AcademicYear, sortField: SortField, sortOrder: string) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'start_date') {
        comparison = (a.start_date || '').localeCompare(b.start_date || '');
      } else if (sortField === 'end_date') {
        comparison = (a.end_date || '').localeCompare(b.end_date || '');
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    },
    'start_date' as SortField
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
    if (!yearToDelete) return;

    try {
      setIsDeleting(true);
      const result = await deleteAcademicYear(yearToDelete.id, explicitBranchId || undefined);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Academic year "${yearToDelete.name}" deleted successfully.`);
        setYearToDelete(null);
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
          <h2 className="text-lg font-semibold text-foreground">Academic Years</h2>
          <p className="text-xs text-muted-foreground">Manage academic years, terms, and operational date ranges.</p>
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
            Create Academic Year
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Input
            id="academic-year-search"
            type="search"
            aria-label="Search academic years"
            placeholder="Search academic years..."
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
              ? '0 academic years'
              : `Showing ${startIndex + 1}-${Math.min(startIndex + pageSize, sortedItems.length)} of ${sortedItems.length} academic years`}
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
            <TableHead scope="col" aria-sort={getAriaSort('start_date')}>
              <button
                type="button"
                onClick={() => handleSort('start_date')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Start Date (${sortField === 'start_date' ? sortOrder : 'none'})`}
              >
                Start Date {getSortIcon('start_date')}
              </button>
            </TableHead>
            <TableHead scope="col" aria-sort={getAriaSort('end_date')}>
              <button
                type="button"
                onClick={() => handleSort('end_date')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by End Date (${sortField === 'end_date' ? sortOrder : 'none'})`}
              >
                End Date {getSortIcon('end_date')}
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
              colSpan={isReadOnly ? 4 : 5}
              title={searchQuery ? 'No matching academic years found' : 'No academic years configured'}
              description={
                searchQuery
                  ? `No academic years matched your query "${searchQuery}". Try a different keyword.`
                  : 'Get started by creating your first academic year.'
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
                    Create Academic Year
                  </Button>
                ) : undefined
              }
            />
          ) : (
            paginatedItems.map((year) => (
              <TableRow key={year.id}>
                <TableCell className="font-medium text-foreground">{year.name}</TableCell>
                <TableCell className="text-muted-foreground">{year.start_date || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{year.end_date || '-'}</TableCell>
                <TableCell>
                  <Badge variant={year.status === 'active' ? 'success' : year.status === 'archived' ? 'destructive' : 'default'}>
                    {year.status}
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
                          setEditingItem(year);
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
                        onClick={() => setYearToDelete(year)}
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
        <AcademicYearForm
          onClose={() => setIsDrawerOpen(false)}
          initialData={editingItem}
          explicitBranchId={explicitBranchId || undefined}
        />
      )}

      {/* Canonical ConfirmDialog: Delete Academic Year */}
      <ConfirmDialog
        isOpen={!!yearToDelete}
        onClose={() => {
          if (!isDeleting) setYearToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Academic Year"
        message={`Are you sure you want to delete academic year "${yearToDelete?.name}"? All associated classes, sections, and scheduling records may be affected. This action cannot be undone.`}
        confirmText="Delete Academic Year"
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
        message="Are you sure you want to clear your search input and return to the complete academic years view?"
        confirmText="Reset Filters"
        cancelText="Keep Search"
        isDestructive={false}
      />
    </div>
  );
}

// Alias export for backward compatibility
export const AcademicYearsList = AcademicYearsTable;



