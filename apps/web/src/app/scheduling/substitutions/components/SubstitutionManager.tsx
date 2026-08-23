"use client";

import { useState } from 'react';
import { TimetableGrid, TimetableEntry, Period } from '../../timetable/components/TimetableGrid';
import { SubstitutionForm, Room, Teacher } from './SubstitutionForm';
import { InstructionalDayResolution } from '@/lib/calendar/resolver';

type Props = Readonly<{
  branchId: string;
  entries: TimetableEntry[];
  periods: Period[];
  rooms: Room[];
  canonicalEntries: TimetableEntry[];
  teachers: Teacher[];
  selectedDate: string;
  isReadOnly: boolean;
  instructionalDay?: InstructionalDayResolution | null;
}>;

export function SubstitutionManager({
  branchId,
  entries,
  periods,
  rooms,
  canonicalEntries,
  teachers,
  selectedDate,
  isReadOnly,
  instructionalDay
}: Props) {
  const [cancelingSubId, setCancelingSubId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEntryClick = (entry: TimetableEntry) => {
    if (isReadOnly) return;
    if (entry.is_substitution && entry.substitution_id) {
      setCancelingSubId(entry.substitution_id);
      setError(null);
    }
  };

  const handleCancelSub = async () => {
    if (!cancelingSubId) return;
    setLoading(true);
    setError(null);
    try {
      const { cancelSubstitution } = await import('../actions');
      const result = await cancelSubstitution(cancelingSubId, branchId);
      if (result?.error) {
        setError(result.error);
      } else {
        setCancelingSubId(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedDate) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
        Please select a date to view and manage substitutions.
      </div>
    );
  }

  const isNonInstructional = Boolean(instructionalDay && !instructionalDay.instructional);

  return (
    <>
      {isNonInstructional && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Non-instructional Day:</strong> Substitutions cannot be scheduled for this date ({instructionalDay?.reason}).
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4">
        {!isReadOnly && !isNonInstructional && (
          <SubstitutionForm 
            branchId={branchId} 
            canonicalEntries={canonicalEntries} 
            rooms={rooms} 
            teachers={teachers} 
            selectedDate={selectedDate}
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 relative">
        {isNonInstructional && (
          <div className="absolute inset-0 bg-gray-50 bg-opacity-75 z-10 flex items-center justify-center pointer-events-none">
            <span className="text-gray-500 font-medium text-lg bg-white px-4 py-2 rounded shadow-sm">
              {instructionalDay?.reason}
            </span>
          </div>
        )}
        <TimetableGrid 
          entries={entries} 
          periods={periods} 
          isReadOnly={isReadOnly || isNonInstructional}
          onEntryClick={handleEntryClick}
        />
      </div>

      {cancelingSubId && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Substitution</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to cancel this substitution? This will restore the canonical timetable entry for this date.
            </p>
            {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" 
                onClick={() => setCancelingSubId(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={loading}
              >
                Close
              </button>
              <button type="button" 
                onClick={handleCancelSub}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Canceling...' : 'Cancel Substitution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
