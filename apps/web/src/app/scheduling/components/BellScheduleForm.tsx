"use client";
import { useState } from 'react';
import { createBellSchedule, updateBellSchedule } from '../actions';
import { BellSchedule } from './types';
import { DrawerForm } from '@/app/academic-structure/components/DrawerForm';
import { Input, Select } from '@/components/ui';

export function BellScheduleForm({ onClose, initialData, explicitBranchId }: { onClose: () => void; initialData?: BellSchedule | null; explicitBranchId?: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      status: formData.get('status') as string,
    };

    try {
      let result;
      if (initialData) {
        result = await updateBellSchedule(initialData.id, data, explicitBranchId || undefined);
      } else {
        result = await createBellSchedule(data, explicitBranchId || undefined);
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
      title={`${initialData ? 'Edit' : 'New'} Bell Schedule`}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    >
      <div className="space-y-4">
        <Input
          required
          defaultValue={initialData?.name}
          type="text"
          name="name"
          id="name"
          label="Name"
          placeholder="e.g. Regular Day Schedule"
        />
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
