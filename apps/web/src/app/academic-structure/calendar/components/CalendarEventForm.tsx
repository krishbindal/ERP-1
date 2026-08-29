'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DrawerForm } from '@/app/academic-structure/components/DrawerForm';
import { createCalendarEvent, updateCalendarEvent } from '@/lib/calendar/actions';
import { CalendarEvent } from '@/lib/calendar/resolver';

interface CalendarEventFormProps {
  initialData?: CalendarEvent | null;
  onClose: () => void;
  explicitBranchId?: string;
  explicitAcademicYearId?: string;
}

export function CalendarEventForm({ initialData, onClose, explicitBranchId, explicitAcademicYearId }: CalendarEventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name || '');
  const [startDate, setStartDate] = useState(initialData?.start_date || '');
  const [endDate, setEndDate] = useState(initialData?.end_date || '');
  const [type, setType] = useState(initialData?.type || 'HOLIDAY');
  const [manualIsInstructional, setManualIsInstructional] = useState(initialData?.is_instructional || false);

  // Derive instructional status
  let isInstructional = manualIsInstructional;
  const isInstructionalReadOnly = type === 'HOLIDAY' || type === 'CLOSURE' || type === 'MAKEUP_DAY';
  if (type === 'HOLIDAY' || type === 'CLOSURE') {
    isInstructional = false;
  } else if (type === 'MAKEUP_DAY') {
    isInstructional = true;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (startDate > endDate) {
      setError('Start date must be before or equal to end date.');
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
      } else {
        router.refresh();
        onClose();
      }
    });
  };

  return (
    <DrawerForm
      title={initialData ? 'Edit Event' : 'Add Event'}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={isPending}
      error={error}
    >
      <div>
        <label htmlFor="event-name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          id="event-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="event-type" className="block text-sm font-medium text-gray-700">Type</label>
        <select
          id="event-type"
          value={type}
          onChange={(e) => setType(e.target.value as "HOLIDAY" | "CLOSURE" | "MAKEUP_DAY" | "OTHER")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="HOLIDAY">Holiday</option>
          <option value="CLOSURE">Closure</option>
          <option value="MAKEUP_DAY">Makeup Day</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            id="start-date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            id="end-date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="is-instructional"
          type="checkbox"
          checked={isInstructional}
          disabled={isInstructionalReadOnly}
          onChange={(e) => setManualIsInstructional(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
        />
        <label htmlFor="is-instructional" className="ml-2 block text-sm text-gray-900">
          Is Instructional Day
        </label>
      </div>
      
      {isInstructionalReadOnly && (
        <p className="text-xs text-gray-500 mt-1">
          Instructional state is derived automatically for the selected event type.
        </p>
      )}
    </DrawerForm>
  );
}
