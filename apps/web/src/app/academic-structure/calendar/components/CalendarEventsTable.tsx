'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarEvent } from '@/lib/calendar/resolver';
import { archiveCalendarEvent } from '@/lib/calendar/actions';
import { CalendarEventForm } from './CalendarEventForm';

export function CalendarEventsTable({
  events,
  isReadOnly,
  explicitBranchId,
  explicitAcademicYearId
}: {
  events: CalendarEvent[];
  isReadOnly: boolean;
  explicitBranchId?: string;
  explicitAcademicYearId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleArchive = (id: string) => {
    if (!confirm('Are you sure you want to archive this event?')) return;
    
    startTransition(async () => {
      setError(null);
      const res = await archiveCalendarEvent(id, explicitBranchId);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
      }
    });
  };

  const getBadgeColor = (type: string, isInstructional: boolean) => {
    if (type === 'HOLIDAY' || type === 'CLOSURE') return 'bg-red-100 text-red-800';
    if (type === 'MAKEUP_DAY') return 'bg-green-100 text-green-800';
    return isInstructional ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white shadow sm:rounded-lg border border-gray-200 mt-6">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Calendar Events</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Exceptions and special events for the academic year.</p>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            onClick={() => {
              setEditingEvent(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Event
          </button>
        )}
      </div>
      
      {error && <div className="px-4 sm:px-6 py-2 text-sm text-red-600 bg-red-50 border-t border-b border-red-200">{error}</div>}
      
      <div className="border-t border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructional</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No events found.
                </td>
              </tr>
            ) : (
              events.map((event) => {
                const badgeClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " + getBadgeColor(event.type, event.is_instructional);
                const dateText = event.start_date === event.end_date 
                      ? event.start_date 
                      : event.start_date + ' to ' + event.end_date;

                return (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dateText}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={badgeClass}>
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.is_instructional ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!isReadOnly && (
                        <div className="flex justify-end space-x-4">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEvent(event);
                              setIsFormOpen(true);
                            }}
                            disabled={isPending}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArchive(event.id)}
                            disabled={isPending}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Archive
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {isFormOpen && (
        <CalendarEventForm
          onClose={() => setIsFormOpen(false)}
          initialData={editingEvent || undefined}
          explicitBranchId={explicitBranchId}
          explicitAcademicYearId={explicitAcademicYearId}
        />
      )}
    </div>
  );
}
