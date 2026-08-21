"use client";

import { useState } from 'react';
import { createTimetableEntry, updateTimetableEntry } from '../actions';
import { DrawerForm } from '@/app/academic-structure/components/DrawerForm';
import { TimetableEntry, Period } from './TimetableGrid';

interface Props {
  branchId: string;
  periods: Period[];
  rooms: { id: string; name: string }[];
  classes: { id: string; name: string }[];
  sections: { id: string; name: string; class_id: string }[];
  subjects: { id: string; name: string }[];
  teachers: { id: string; staff?: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] }[];
  initialData?: TimetableEntry | null;
  triggerOpen?: boolean;
  onClose?: () => void;
}

export function TimetableEntryForm({
  branchId,
  periods,
  rooms,
  classes,
  sections,
  subjects,
  teachers,
  initialData,
  triggerOpen = false,
  onClose,
}: Props & { triggerOpen?: boolean; onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(triggerOpen);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Cascading state
  const [selectedClassId, setSelectedClassId] = useState<string>(initialData?.class_id || '');

  const filteredSections = sections.filter(s => !selectedClassId || s.class_id === selectedClassId);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      class_id: formData.get('class_id') as string,
      section_id: formData.get('section_id') as string,
      subject_id: formData.get('subject_id') as string,
      period_id: formData.get('period_id') as string,
      room_id: formData.get('room_id') as string,
      staff_branch_profile_id: formData.get('staff_branch_profile_id') as string,
      day_of_week: Number.Number.parseInt(formData.get('day_of_week') as string, 10),
      status: formData.get('status') as string || 'ACTIVE',
    };

    try {
      let result;
      if (initialData) {
        result = await updateTimetableEntry(initialData.id, data, branchId);
      } else {
        result = await createTimetableEntry(data, branchId);
      }

      if (result?.error) {
        setError(result.error);
      } else {
        handleClose();
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
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
      >
        {initialData ? 'Edit Entry' : 'Create Timetable Entry'}
      </button>

      {isOpen && (
        <DrawerForm
          title={initialData ? "Edit Timetable Entry" : "New Timetable Entry"}
          onClose={handleClose}
          onSubmit={handleSubmit}
          error={error}
          loading={loading}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select 
                name="class_id" 
                className="w-full border border-gray-300 rounded-md p-2" 
                required 
                defaultValue={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                <option value="">Select a class...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="section_id" className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select id="section_id" name="section_id" className="w-full border border-gray-300 rounded-md p-2" required defaultValue={initialData?.section_id || ''}>
                <option value="">Select a section...</option>
                {filteredSections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subject_id" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select id="subject_id" name="subject_id" className="w-full border border-gray-300 rounded-md p-2" required defaultValue={initialData?.subject_id || ''}>
                <option value="">Select a subject...</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="staff_branch_profile_id" className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
              <select id="staff_branch_profile_id" name="staff_branch_profile_id" className="w-full border border-gray-300 rounded-md p-2" required defaultValue={initialData?.staff_branch_profile_id || ''}>
                <option value="">Select Teacher...</option>
                {teachers.map(t => {
                  const name = t.staff ? (Array.isArray(t.staff) ? `${t.staff[0].first_name} ${t.staff[0].last_name}` : `${t.staff.first_name} ${t.staff.last_name}`) : 'Unknown';
                  return (
                    <option key={t.id} value={t.id}>{name}</option>
                  );
                })}
              </select>
            </div>

            <div>
              <label htmlFor="room_id" className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <select id="room_id" name="room_id" className="w-full border border-gray-300 rounded-md p-2" required defaultValue={initialData?.room_id || ''}>
                <option value="">Select a room...</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="period_id" className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <select id="period_id" name="period_id" className="w-full border border-gray-300 rounded-md p-2" required defaultValue={initialData?.period_id || ''}>
                <option value="">Select a period...</option>
                {periods.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.start_time} - {p.end_time})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
              <select id="day_of_week" name="day_of_week" className="w-full border border-gray-300 rounded-md p-2" required defaultValue={initialData?.day_of_week || ''}>
                <option value="">Select a day...</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                <option value="7">Sunday</option>
              </select>
            </div>

            {initialData && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Are you sure you want to archive this timetable entry?')) {
                      setLoading(true);
                      const { archiveTimetableEntry } = await import('../actions');
                      const result = await archiveTimetableEntry(initialData.id, branchId);
                      setLoading(false);
                      if (result?.error) setError(result.error);
                      else handleClose();
                    }
                  }}
                  className="w-full py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium text-sm"
                  disabled={loading}
                >
                  Archive Entry
                </button>
              </div>
            )}
          </div>
        </DrawerForm>
      )}
    </>
  );
}
