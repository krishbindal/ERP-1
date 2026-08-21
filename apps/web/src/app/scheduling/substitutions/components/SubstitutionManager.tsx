"use client";

import { useState } from 'react';
import { TimetableGrid, TimetableEntry, Period } from '../../timetable/components/TimetableGrid';
import { SubstitutionForm, Room, Teacher } from './SubstitutionForm';

type Props = Readonly<{
  branchId: string;
  entries: TimetableEntry[];
  periods: Period[];
  rooms: Room[];
  canonicalEntries: TimetableEntry[];
  teachers: Teacher[];
  selectedDate: string;
  isReadOnly: boolean;
}>;

export function SubstitutionManager({
  branchId,
  entries,
  periods,
  rooms,
  canonicalEntries,
  teachers,
  selectedDate,
  isReadOnly
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

  return (
    <>
      <div className="flex justify-end mb-4">
        {!isReadOnly && (
          <SubstitutionForm 
            branchId={branchId} 
            canonicalEntries={canonicalEntries} 
            rooms={rooms} 
            teachers={teachers} 
            selectedDate={selectedDate}
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <TimetableGrid 
          entries={entries} 
          periods={periods} 
          isReadOnly={isReadOnly}
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
