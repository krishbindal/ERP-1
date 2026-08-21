"use client";
import { useState } from 'react';
import { createPeriod, updatePeriod } from '../actions';
import { Period, BellSchedule } from './types';
import { DrawerForm } from '@/app/academic-structure/components/DrawerForm';

export function PeriodForm({ onClose, initialData, schedules, explicitBranchId }: { onClose: () => void; initialData?: Period | null; schedules: BellSchedule[]; explicitBranchId?: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      bell_schedule_id: formData.get('bell_schedule_id') as string,
      name: formData.get('name') as string,
      start_time: formData.get('start_time') as string,
      end_time: formData.get('end_time') as string,
      status: formData.get('status') as string,
    };

    try {
      let result;
      if (initialData) {
        // Exclude bell_schedule_id from update payload, since periods belong strictly to the created schedule.
        const { bell_schedule_id, ...updateData } = data;
        result = await updatePeriod(initialData.id, updateData, explicitBranchId || undefined);
      } else {
        result = await createPeriod(data, explicitBranchId || undefined);
      }

      if (result.error) {
        setError(result.error);
      } else {
        onClose();
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
    <DrawerForm 
      title={`${initialData ? 'Edit' : 'New'} Period`}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    >
      {!initialData && (
        <div>
          <label htmlFor="bell_schedule_id" className="block text-sm font-medium text-gray-900">Bell Schedule</label>
          <div className="mt-1">
            <select required name="bell_schedule_id" id="bell_schedule_id" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md">
              <option value="">Select a Bell Schedule</option>
              {schedules.map(schedule => (
                <option key={schedule.id} value={schedule.id}>{schedule.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900">Name</label>
        <div className="mt-1">
          <input required defaultValue={initialData?.name} type="text" name="name" id="name" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
        </div>
      </div>
      <div>
        <label htmlFor="start_time" className="block text-sm font-medium text-gray-900">Start Time</label>
        <div className="mt-1">
          <input required defaultValue={initialData?.start_time} type="time" name="start_time" id="start_time" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
        </div>
      </div>
      <div>
        <label htmlFor="end_time" className="block text-sm font-medium text-gray-900">End Time</label>
        <div className="mt-1">
          <input required defaultValue={initialData?.end_time} type="time" name="end_time" id="end_time" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
        </div>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-900">Status</label>
        <div className="mt-1">
          <select required defaultValue={initialData?.status || 'ACTIVE'} name="status" id="status" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md">
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>
    </DrawerForm>
  );
}
