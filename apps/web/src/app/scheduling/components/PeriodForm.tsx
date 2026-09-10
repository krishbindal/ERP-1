"use client";
import { useState } from 'react';
import { createPeriod, updatePeriod } from '../actions';
import { Period, BellSchedule } from './types';
import { DrawerForm } from '@/app/academic-structure/components/DrawerForm';
import { Input, Select } from '@/components/ui';

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
        const updateData = {
          name: data.name,
          start_time: data.start_time,
          end_time: data.end_time,
          status: data.status,
        };
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
      <div className="space-y-4">
        {!initialData && (
          <Select
            required
            name="bell_schedule_id"
            id="bell_schedule_id"
            label="Bell Schedule"
            placeholder="Select a Bell Schedule"
            options={schedules.map(schedule => ({ value: schedule.id, label: schedule.name }))}
          />
        )}
        <Input
          required
          defaultValue={initialData?.name}
          type="text"
          name="name"
          id="name"
          label="Name"
          placeholder="e.g. Period 1"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            required
            defaultValue={initialData?.start_time}
            type="time"
            name="start_time"
            id="start_time"
            label="Start Time"
          />
          <Input
            required
            defaultValue={initialData?.end_time}
            type="time"
            name="end_time"
            id="end_time"
            label="End Time"
          />
        </div>
        <Select
          required
          defaultValue={initialData?.status || 'ACTIVE'}
          name="status"
          id="status"
          label="Status"
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'ARCHIVED', label: 'Archived' },
          ]}
        />
      </div>
    </DrawerForm>
  );
}
