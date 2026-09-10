'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DrawerForm } from '@/app/academic-structure/components/DrawerForm';
import { createCalendarEvent, updateCalendarEvent, archiveCalendarEvent } from '@/lib/calendar/actions';
import { CalendarEvent } from '@/lib/calendar/resolver';
import { ConfirmDialog, Button, toast } from '@/components/ui';

export interface EventModalProps {
  initialData?: CalendarEvent | null;
  onClose: () => void;
  explicitBranchId?: string;
  explicitAcademicYearId?: string;
}

export function EventModal({
  initialData,
  onClose,
  explicitBranchId,
  explicitAcademicYearId,
}: EventModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name || '');
  const [startDate, setStartDate] = useState(initialData?.start_date || '');
  const [endDate, setEndDate] = useState(initialData?.end_date || '');
  const [type, setType] = useState<"HOLIDAY" | "CLOSURE" | "MAKEUP_DAY" | "OTHER">(
    (initialData?.type as "HOLIDAY" | "CLOSURE" | "MAKEUP_DAY" | "OTHER") || 'HOLIDAY'
  );
  const [manualIsInstructional, setManualIsInstructional] = useState(initialData?.is_instructional || false);

  // ConfirmDialog states (2 distinct confirmation flows)
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Track if dirty
  const isDirty =
    name !== (initialData?.name || '') ||
    startDate !== (initialData?.start_date || '') ||
    endDate !== (initialData?.end_date || '') ||
    type !== ((initialData?.type as "HOLIDAY" | "CLOSURE" | "MAKEUP_DAY" | "OTHER") || 'HOLIDAY');

  // Derive instructional status
  let isInstructional = manualIsInstructional;
  const isInstructionalReadOnly = type === 'HOLIDAY' || type === 'CLOSURE' || type === 'MAKEUP_DAY';
  if (type === 'HOLIDAY' || type === 'CLOSURE') {
    isInstructional = false;
  } else if (type === 'MAKEUP_DAY') {
    isInstructional = true;
  }

  const handleSafeClose = () => {
    if (isDirty) {
      setDiscardConfirmOpen(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (startDate > endDate) {
      const msg = 'Start date must be before or equal to end date.';
      setError(msg);
      toast.error(msg);
      return;
    }

    startTransition(async () => {
      setError(null);
      const payload = {
        name,
        start_date: startDate,
        end_date: endDate,
        type,
        is_instructional: isInstructional,
      };

      const res = initialData
        ? await updateCalendarEvent(initialData.id, payload, explicitBranchId)
        : await createCalendarEvent(payload, explicitBranchId, explicitAcademicYearId);

      if (res.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        toast.success(
          initialData
            ? `Calendar event "${name}" updated successfully.`
            : `Calendar event "${name}" created successfully.`
        );
        router.refresh();
        onClose();
      }
    });
  };

  const handleArchiveConfirm = async () => {
    if (!initialData) return;

    try {
      setIsArchiving(true);
      const res = await archiveCalendarEvent(initialData.id, explicitBranchId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Calendar event "${initialData.name}" archived successfully.`);
        router.refresh();
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to archive event.';
      toast.error(msg);
    } finally {
      setIsArchiving(false);
      setArchiveConfirmOpen(false);
    }
  };

  return (
    <>
      <DrawerForm
        title={initialData ? 'Edit Event' : 'Add Event'}
        onClose={handleSafeClose}
        onSubmit={handleSubmit}
        loading={isPending}
        error={error}
      >
        <div>
          <label htmlFor="event-name" className="block text-sm font-medium text-foreground">
            Name
          </label>
          <input
            type="text"
            id="event-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-input bg-surface text-foreground shadow-sm focus-ring sm:text-sm px-3 py-2 min-h-[44px] sm:min-h-0"
          />
        </div>

        <div>
          <label htmlFor="event-type" className="block text-sm font-medium text-foreground">
            Type
          </label>
          <select
            id="event-type"
            value={type}
            onChange={(e) => setType(e.target.value as "HOLIDAY" | "CLOSURE" | "MAKEUP_DAY" | "OTHER")}
            className="mt-1 block w-full rounded-md border border-input bg-surface text-foreground shadow-sm focus-ring sm:text-sm px-3 py-2 min-h-[44px] sm:min-h-0"
          >
            <option value="HOLIDAY">Holiday</option>
            <option value="CLOSURE">Closure</option>
            <option value="MAKEUP_DAY">Makeup Day</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-foreground">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-surface text-foreground shadow-sm focus-ring sm:text-sm px-3 py-2 min-h-[44px] sm:min-h-0"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-foreground">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-surface text-foreground shadow-sm focus-ring sm:text-sm px-3 py-2 min-h-[44px] sm:min-h-0"
            />
          </div>
        </div>

        <div className="flex items-center min-h-[44px] sm:min-h-0">
          <input
            id="is-instructional"
            type="checkbox"
            checked={isInstructional}
            disabled={isInstructionalReadOnly}
            onChange={(e) => setManualIsInstructional(e.target.checked)}
            className="h-4 w-4 text-primary focus-ring border-input rounded disabled:opacity-50"
          />
          <label htmlFor="is-instructional" className="ml-2 block text-sm text-foreground cursor-pointer">
            Is Instructional Day
          </label>
        </div>

        {isInstructionalReadOnly && (
          <p className="text-xs text-muted-foreground mt-1">
            Instructional state is derived automatically for the selected event type.
          </p>
        )}

        {initialData && (
          <div className="pt-4 border-t border-border mt-4">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setArchiveConfirmOpen(true)}
              className="w-full"
            >
              Archive This Event
            </Button>
          </div>
        )}
      </DrawerForm>

      {/* ConfirmDialog 1: Discard Unsaved Changes */}
      <ConfirmDialog
        isOpen={discardConfirmOpen}
        onClose={() => setDiscardConfirmOpen(false)}
        onConfirm={() => {
          setDiscardConfirmOpen(false);
          onClose();
        }}
        title="Discard Unsaved Changes"
        message="You have unsaved changes to this calendar event. Are you sure you want to discard them and close?"
        confirmText="Discard Changes"
        cancelText="Keep Editing"
        isDestructive={true}
      />

      {/* ConfirmDialog 2: Archive Event from Modal */}
      <ConfirmDialog
        isOpen={archiveConfirmOpen}
        onClose={() => {
          if (!isArchiving) setArchiveConfirmOpen(false);
        }}
        onConfirm={handleArchiveConfirm}
        title="Archive Calendar Event"
        message={`Are you sure you want to archive event "${initialData?.name}"? It will no longer appear on the instructional calendar.`}
        confirmText="Archive Event"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isArchiving}
      />
    </>
  );
}

// Alias export for backward compatibility
export const CalendarEventForm = EventModal;
