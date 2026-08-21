"use client";

import { useState } from 'react';
import { createSubstitution } from '../actions';
import { TeacherSelect } from "../../components/TeacherSelect";
import { DrawerForm } from '@/app/academic-structure/components/DrawerForm';
import { TimetableEntry } from '../../timetable/components/TimetableGrid';

export interface Room {
  id: string;
  name: string;
}

export interface Teacher {
  id: string;
  staff?: {
    first_name: string;
    last_name: string;
  } | {
    first_name: string;
    last_name: string;
  }[];
}

type Props = Readonly<{
  branchId: string;
  canonicalEntries: TimetableEntry[];
  rooms: Room[];
  teachers: Teacher[];
  selectedDate: string;
}>;

export function SubstitutionForm({
  branchId,
  canonicalEntries,
  rooms,
  teachers,
  selectedDate,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      timetable_entry_id: formData.get('timetable_entry_id') as string,
      substitution_date: formData.get('substitution_date') as string,
      substitute_staff_id: formData.get('substitute_staff_id') as string,
      substitute_room_id: (formData.get('substitute_room_id') as string) || undefined,
      reason: formData.get('reason') as string,
    };

    try {
      const result = await createSubstitution(data, branchId);

      if (result?.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
      >
        New Substitution
      </button>

      {isOpen && (
        <DrawerForm
          title="Create Substitution"
          onClose={() => setIsOpen(false)}
          onSubmit={handleSubmit}
          error={error}
          loading={loading}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="substitution_date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input id="substitution_date"
                type="date"
                name="substitution_date" 
                className="w-full border border-gray-300 rounded-md p-2" 
                required 
                defaultValue={selectedDate}
              />
            </div>

            <div>
              <label htmlFor="timetable_entry_id" className="block text-sm font-medium text-gray-700 mb-1">Canonical Target Entry</label>
              <select id="timetable_entry_id" name="timetable_entry_id" className="w-full border border-gray-300 rounded-md p-2" required>
                <option value="">Select entry...</option>
                {canonicalEntries.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.classes?.name} {e.sections?.name} - {e.subjects?.name} ({e.periods?.name})
                  </option>
                ))}
              </select>
            </div>

            <TeacherSelect teachers={teachers} id="substitute_staff_id" name="substitute_staff_id" label="Substitute Teacher" />

            <div>
              <label htmlFor="substitute_room_id" className="block text-sm font-medium text-gray-700 mb-1">Substitute Room (Optional)</label>
              <select id="substitute_room_id" name="substitute_room_id" className="w-full border border-gray-300 rounded-md p-2">
                <option value="">-- No Room Change --</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
              <input id="reason"
                type="text"
                name="reason" 
                className="w-full border border-gray-300 rounded-md p-2" 
                placeholder="E.g., Sick Leave"
              />
            </div>
          </div>
        </DrawerForm>
      )}
    </>
  );
}
