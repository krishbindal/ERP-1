"use client";

import React, { useState, useMemo } from 'react';
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
import { SectionForm } from './SectionForm';
import { deleteSection } from '../actions';
import { SectionWithClass } from './types';

export interface SectionsListProps {
  data: SectionWithClass[];
  isReadOnly: boolean;
  explicitBranchId?: string | null;
}

type SortField = 'name' | 'class' | 'capacity';
type SortOrder = 'asc' | 'desc';

export function SectionsList({ data, isReadOnly, explicitBranchId }: SectionsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Drawer / modal states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SectionWithClass | null>(null);

  // ConfirmDialog states (2 distinct confirmation flows)
  const [sectionToDelete, setSectionToDelete] = useState<SectionWithClass | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetFiltersConfirmOpen, setResetFiltersConfirmOpen] = useState(false);

  // Filtering
  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    return data.filter((sec) => {
      const nameMatch = sec.name?.toLowerCase().includes(query);
      const classMatch = sec.classes?.name?.toLowerCase().includes(query);
      const capacityMatch = sec.capacity?.toString().includes(query);
      return nameMatch || classMatch || capacityMatch;
    });
  }, [data, searchQuery]);

  // Sorting
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'class') {
        const classA = a.classes?.name || '';
        const classB = b.classes?.name || '';
        comparison = classA.localeCompare(classB);
      } else if (sortField === 'capacity') {
        comparison = (a.capacity ?? 0) - (b.capacity ?? 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortOrder]);

  // Pagination
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
    if (!sectionToDelete) return;

    try {
      setIsDeleting(true);
      const result = await deleteSection(sectionToDelete.id, explicitBranchId || undefined);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Section "${sectionToDelete.name}" deleted successfully.`);
        setSectionToDelete(null);
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
          <h2 className="text-lg font-semibold text-foreground">Sections</h2>
          <p className="text-xs text-muted-foreground">Manage sections and student capacities across classes.</p>
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
            Create Section
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Input
            id="section-search"
            type="search"
            aria-label="Search sections"
            placeholder="Search sections..."
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
            {sortedData.length === 0
              ? '0 sections'
              : `Showing ${startIndex + 1}-${Math.min(startIndex + pageSize, sortedData.length)} of ${sortedData.length} sections`}
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
                aria-label={`Sort by Section Name (${sortField === 'name' ? sortOrder : 'none'})`}
              >
                Name {getSortIcon('name')}
              </button>
            </TableHead>
            <TableHead scope="col" aria-sort={getAriaSort('class')}>
              <button
                type="button"
                onClick={() => handleSort('class')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Class (${sortField === 'class' ? sortOrder : 'none'})`}
              >
                Class {getSortIcon('class')}
              </button>
            </TableHead>
            <TableHead scope="col" aria-sort={getAriaSort('capacity')}>
              <button
                type="button"
                onClick={() => handleSort('capacity')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Capacity (${sortField === 'capacity' ? sortOrder : 'none'})`}
              >
                Capacity {getSortIcon('capacity')}
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
          {sortedData.length === 0 ? (
            <TableEmptyRow
              colSpan={isReadOnly ? 3 : 4}
              title={searchQuery ? 'No matching sections found' : 'No sections configured'}
              description={
                searchQuery
                  ? `No sections matched your query "${searchQuery}". Try a different keyword.`
                  : 'Get started by creating your first class section.'
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
                    Create Section
                  </Button>
                ) : undefined
              }
            />
          ) : (
            paginatedData.map((sec) => (
              <TableRow key={sec.id}>
                <TableCell className="font-medium text-foreground">{sec.name}</TableCell>
                <TableCell className="text-muted-foreground">{sec.classes?.name || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{sec.capacity ?? '-'}</TableCell>
                {!isReadOnly && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingItem(sec);
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
                        onClick={() => setSectionToDelete(sec)}
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

      {/* Drawer Form for Edit/Create */}
      {isDrawerOpen && (
        <SectionForm
          onClose={() => setIsDrawerOpen(false)}
          initialData={editingItem}
          explicitBranchId={explicitBranchId || undefined}
        />
      )}

      {/* Canonical ConfirmDialog 1: Delete Section */}
      <ConfirmDialog
        isOpen={!!sectionToDelete}
        onClose={() => {
          if (!isDeleting) setSectionToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Section"
        message={`Are you sure you want to delete section "${sectionToDelete?.name}"? Any active student enrollments in this section will be impacted. This action cannot be undone.`}
        confirmText="Delete Section"
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
        message="Are you sure you want to clear your search input and return to the complete sections view?"
        confirmText="Reset Filters"
        cancelText="Keep Search"
        isDestructive={false}
      />
    </div>
  );
}

// Alias export for backward compatibility
export const SectionsTable = SectionsList;
