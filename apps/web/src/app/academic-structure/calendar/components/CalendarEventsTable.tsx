'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Plus, RotateCcw } from 'lucide-react';
import { CalendarEvent } from '@/lib/calendar/resolver';
import { archiveCalendarEvent } from '@/lib/calendar/actions';
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
import { EventModal } from './EventModal';

export interface CalendarEventsTableProps {
  events: CalendarEvent[];
  isReadOnly: boolean;
  explicitBranchId?: string;
  explicitAcademicYearId?: string;
}

type SortField = 'name' | 'start_date' | 'type' | 'is_instructional';
type SortOrder = 'asc' | 'desc';

export function CalendarEventsTable({
  events,
  isReadOnly,
  explicitBranchId,
  explicitAcademicYearId,
}: CalendarEventsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Sorting & Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('start_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Drawer / Modal state
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ConfirmDialog states (2 distinct confirmation flows)
  const [eventToArchive, setEventToArchive] = useState<CalendarEvent | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [resetFiltersConfirmOpen, setResetFiltersConfirmOpen] = useState(false);

  // Filter
  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return events;

    return events.filter((event) => {
      const nameMatch = event.name.toLowerCase().includes(query);
      const typeMatch = event.type.toLowerCase().includes(query);
      const dateMatch =
        event.start_date.toLowerCase().includes(query) ||
        event.end_date.toLowerCase().includes(query);
      return nameMatch || typeMatch || dateMatch;
    });
  }, [events, searchQuery]);

  // Sort
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'start_date') {
        comparison = a.start_date.localeCompare(b.start_date);
      } else if (sortField === 'type') {
        comparison = a.type.localeCompare(b.type);
      } else if (sortField === 'is_instructional') {
        comparison = (a.is_instructional ? 1 : 0) - (b.is_instructional ? 1 : 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredEvents, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedEvents = sortedEvents.slice(startIndex, startIndex + pageSize);

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

  const getBadgeVariant = (type: string): 'destructive' | 'success' | 'default' | 'outline' => {
    if (type === 'HOLIDAY' || type === 'CLOSURE') return 'destructive';
    if (type === 'MAKEUP_DAY') return 'success';
    return 'outline';
  };

  const confirmArchive = async () => {
    if (!eventToArchive) return;

    try {
      setIsArchiving(true);
      const res = await archiveCalendarEvent(eventToArchive.id, explicitBranchId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Event "${eventToArchive.name}" archived successfully.`);
        setEventToArchive(null);
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to archive event.';
      toast.error(msg);
    } finally {
      setIsArchiving(false);
    }
  };

  const confirmResetFilters = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setResetFiltersConfirmOpen(false);
    toast.info('Calendar event filters reset.');
  };

  return (
    <div className="space-y-4 mt-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Calendar Events</h3>
          <p className="text-xs text-muted-foreground">Exceptions, holidays, and instructional days for the academic year.</p>
        </div>
        {!isReadOnly && (
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setEditingEvent(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Event
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Input
            id="event-search"
            type="search"
            aria-label="Search events"
            placeholder="Search events by name or type..."
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
            {sortedEvents.length === 0
              ? '0 events'
              : `Showing ${startIndex + 1}-${Math.min(startIndex + pageSize, sortedEvents.length)} of ${sortedEvents.length} events`}
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
                aria-label={`Sort by Event Name (${sortField === 'name' ? sortOrder : 'none'})`}
              >
                Name {getSortIcon('name')}
              </button>
            </TableHead>
            <TableHead scope="col" aria-sort={getAriaSort('start_date')}>
              <button
                type="button"
                onClick={() => handleSort('start_date')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Dates (${sortField === 'start_date' ? sortOrder : 'none'})`}
              >
                Dates {getSortIcon('start_date')}
              </button>
            </TableHead>
            <TableHead scope="col" aria-sort={getAriaSort('type')}>
              <button
                type="button"
                onClick={() => handleSort('type')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Type (${sortField === 'type' ? sortOrder : 'none'})`}
              >
                Type {getSortIcon('type')}
              </button>
            </TableHead>
            <TableHead scope="col" aria-sort={getAriaSort('is_instructional')}>
              <button
                type="button"
                onClick={() => handleSort('is_instructional')}
                className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground focus-ring rounded"
                aria-label={`Sort by Instructional Status (${sortField === 'is_instructional' ? sortOrder : 'none'})`}
              >
                Instructional {getSortIcon('is_instructional')}
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
          {sortedEvents.length === 0 ? (
            <TableEmptyRow
              colSpan={isReadOnly ? 4 : 5}
              title={searchQuery ? 'No matching events found' : 'No calendar events'}
              description={
                searchQuery
                  ? `No events matched your search "${searchQuery}".`
                  : 'No exceptions or events have been configured for this academic year.'
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
                      setEditingEvent(null);
                      setIsFormOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                    Add Event
                  </Button>
                ) : undefined
              }
            />
          ) : (
            paginatedEvents.map((event) => {
              const dateText =
                event.start_date === event.end_date
                  ? event.start_date
                  : `${event.start_date} to ${event.end_date}`;

              return (
                <TableRow key={event.id}>
                  <TableCell className="font-medium text-foreground">{event.name}</TableCell>
                  <TableCell className="text-muted-foreground">{dateText}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(event.type)}>
                      {event.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.is_instructional ? (
                      <span className="text-success font-medium">Yes</span>
                    ) : (
                      'No'
                    )}
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingEvent(event);
                            setIsFormOpen(true);
                          }}
                          disabled={isPending}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEventToArchive(event)}
                          disabled={isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Archive
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
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

      {/* Drawer Form Modal */}
      {isFormOpen && (
        <EventModal
          onClose={() => setIsFormOpen(false)}
          initialData={editingEvent || undefined}
          explicitBranchId={explicitBranchId}
          explicitAcademicYearId={explicitAcademicYearId}
        />
      )}

      {/* ConfirmDialog 1: Archive Event */}
      <ConfirmDialog
        isOpen={!!eventToArchive}
        onClose={() => {
          if (!isArchiving) setEventToArchive(null);
        }}
        onConfirm={confirmArchive}
        title="Archive Calendar Event"
        message={`Are you sure you want to archive event "${eventToArchive?.name}"? It will no longer be considered for instructional days calculations.`}
        confirmText="Archive Event"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isArchiving}
      />

      {/* ConfirmDialog 2: Reset Filters Confirmation */}
      <ConfirmDialog
        isOpen={resetFiltersConfirmOpen}
        onClose={() => setResetFiltersConfirmOpen(false)}
        onConfirm={confirmResetFilters}
        title="Reset Search Filters"
        message="Are you sure you want to clear your search query and return to all calendar events?"
        confirmText="Reset Filters"
        cancelText="Keep Search"
        isDestructive={false}
      />
    </div>
  );
}
