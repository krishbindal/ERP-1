'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateOperatingDays } from '@/lib/calendar/actions';

const DAYS = [
  { id: 1, label: 'Monday' },
  { id: 2, label: 'Tuesday' },
  { id: 3, label: 'Wednesday' },
  { id: 4, label: 'Thursday' },
  { id: 5, label: 'Friday' },
  { id: 6, label: 'Saturday' },
  { id: 7, label: 'Sunday' },
];

export function OperatingDaysEditor({
  initialDays,
  isReadOnly,
  explicitBranchId,
  explicitAcademicYearId
}: {
  initialDays: number[];
  isReadOnly: boolean;
  explicitBranchId?: string;
  explicitAcademicYearId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDays, setSelectedDays] = useState<number[]>(initialDays);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleDay = (dayId: number) => {
    if (isReadOnly || isPending) return;
    
    setError(null);
    setSuccess(false);
    
    const newSelection = selectedDays.includes(dayId)
      ? selectedDays.filter((d) => d !== dayId)
      : [...selectedDays, dayId].sort((a, b) => a - b);

    if (newSelection.length === 0) {
      setError('At least one operating day must be selected.');
      return;
    }

    setSelectedDays(newSelection);
  };

  const saveChanges = () => {
    if (isReadOnly || selectedDays.length === 0) return;
    
    startTransition(async () => {
      setError(null);
      setSuccess(false);
      const res = await updateOperatingDays(selectedDays, explicitBranchId, explicitAcademicYearId);
      
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  const isDirty = JSON.stringify(selectedDays) !== JSON.stringify([...initialDays].sort((a, b) => a - b));

  return (
    <div className="bg-white p-6 shadow sm:rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Operating Days</h2>
          <p className="text-sm text-gray-500">Select the default active school days for the academic year.</p>
        </div>
        {!isReadOnly && (
          <button
            type="button"
            disabled={!isDirty || isPending}
            onClick={saveChanges}
            className="inline-flex items-center justify-center min-h-[44px] sm:min-h-0 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:opacity-90 focus-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {error && <div className="mb-4 text-sm text-destructive">{error}</div>}
      {success && <div className="mb-4 text-sm text-success">Operating days updated successfully.</div>}

      <div className="flex flex-wrap gap-2 sm:gap-4">
        {DAYS.map((day) => {
          const isSelected = selectedDays.includes(day.id);
          const isOnlyRemaining = isSelected && selectedDays.length === 1;
          const isDisabled = isReadOnly || isPending || isOnlyRemaining;

          return (
            <div key={day.id} className="flex items-center min-h-[44px] sm:min-h-0 py-1.5 px-2 rounded-md hover:bg-muted/40 cursor-pointer touch-manipulation">
              <input
                id={`operating-day-${day.id}`}
                name={`operating-day-${day.id}`}
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => toggleDay(day.id)}
                className="h-4 w-4 text-primary focus-ring border-input rounded disabled:opacity-50 cursor-pointer"
                aria-disabled={isDisabled}
              />
              <label htmlFor={`operating-day-${day.id}`} className="ml-2 block text-sm text-foreground cursor-pointer select-none">
                {day.label}
              </label>
              {isOnlyRemaining && (
                <span className="sr-only">At least one operating day must remain selected.</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
