"use client";

import React, { useState } from 'react';
import { useDataTable } from '@/hooks/useDataTable';
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
  ConfirmDialog,
  toast,
} from '@/components/ui';
import { ClassForm } from './ClassForm';
import { deleteClass } from '../actions';
import { ClassWithYear } from './types';

export interface ClassesListProps {
  data: ClassWithYear[];
  isReadOnly: boolean;
  explicitBranchId?: string | null;
}

type SortField = 'name' | 'academic_year' | 'level';
type SortOrder = 'asc' | 'desc';

export function ClassesList({ data, isReadOnly, explicitBranchId }: ClassesListProps) {
  

  // Drawer / modal states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassWithYear | null>(null);

  // ConfirmDialog states (2 distinct confirmation flows)
  const [classToDelete, setClassToDelete] = useState<ClassWithYear | null>(null);
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
  } = useDataTable<ClassWithYear, SortField>(
    data,
    (cls: ClassWithYear, query: string) => {
      const nameMatch = cls.name?.toLowerCase().includes(query);
      const yearMatch = cls.academic_years?.name?.toLowerCase().includes(query);
      const levelMatch = cls.level?.toString().includes(query);
      return nameMatch || yearMatch || levelMatch;
    },
    (a: ClassWithYear, b: ClassWithYear, sortField: SortField, sortOrder: string) => {
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
    if (!classToDelete) return;

    try {
      setIsDeleting(true);
      const result = await deleteClass(classToDelete.id, explicitBranchId || undefined);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Class "${classToDelete.name}" deleted successfully.`);
        setClassToDelete(null);
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
          <h2 className="text-lg font-semibold text-foreground">Classes</h2>
          <p className="text-xs text-muted-foreground">Manage classes and grade levels across academic years.</p>
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
            Create Class
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Input
            id="class-search"
            type="search"
            aria-label="Search classes"
            placeholder="Search classes..."
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
              ? '0 classes'
              : `Showing ${startIndex + 1}-${Math.min(startIndex + pageSize, sortedItems.length)} of ${sortedItems.length} classes`}
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
                aria-label={`Sort by Class Name (${sortField === 'name' ? sortOrder : 'none'})`}
              >
                Name {getSortIcon('name')}
              </button>
            </TableHead>
            <TableHead scope="col" aria-sort={getAriaSort('academic_year')}>
              <button
                type="button"
                onClick={() => handleSort('academic_year')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Academic Year (${sortField === 'academic_year' ? sortOrder : 'none'})`}
              >
                Academic Year {getSortIcon('academic_year')}
              </button>
            </TableHead>
            <TableHead scope="col" aria-sort={getAriaSort('level')}>
              <button
                type="button"
                onClick={() => handleSort('level')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Level (${sortField === 'level' ? sortOrder : 'none'})`}
              >
                Level {getSortIcon('level')}
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
              colSpan={isReadOnly ? 3 : 4}
              title={searchQuery ? 'No matching classes found' : 'No classes configured'}
              description={
                searchQuery
                  ? `No classes matched your query "${searchQuery}". Try a different keyword.`
                  : 'Get started by creating your first academic class.'
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
                    Create Class
                  </Button>
                ) : undefined
              }
            />
          ) : (
            paginatedItems.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell className="font-medium text-foreground">{cls.name}</TableCell>
                <TableCell className="text-muted-foreground">{cls.academic_years?.name || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{cls.level ?? '-'}</TableCell>
                {!isReadOnly && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingItem(cls);
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
                        onClick={() => setClassToDelete(cls)}
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
        <ClassForm
          onClose={() => setIsDrawerOpen(false)}
          initialData={editingItem}
          explicitBranchId={explicitBranchId || undefined}
        />
      )}

      {/* Canonical ConfirmDialog 1: Delete Class */}
      <ConfirmDialog
        isOpen={!!classToDelete}
        onClose={() => {
          if (!isDeleting) setClassToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Class"
        message={`Are you sure you want to delete class "${classToDelete?.name}"? All associated sections and subject allocations may be affected. This action cannot be undone.`}
        confirmText="Delete Class"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />

      {/* Canonical ConfirmDialog 2: Reset Filters Confirmation */}
      <ConfirmDialog
        isOpen={resetFiltersConfirmOpen}
        onClose={() => setResetFiltersConfirmOpen(false)}
        onConfirm={confirmResetFilters}
        title="Reset Search Filters"
        message="Are you sure you want to clear your search input and return to the complete classes view?"
        confirmText="Reset Filters"
        cancelText="Keep Search"
        isDestructive={false}
      />
    </div>
  );
}

// Alias export for backward compatibility
export const ClassesTable = ClassesList;



