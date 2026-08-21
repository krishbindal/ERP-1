"use client";
import { useState } from 'react';
import { createBellSchedule, updateBellSchedule } from '../actions';
import { BellSchedule } from './types';
import { DrawerForm } from '@/app/academic-structure/components/DrawerForm';

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
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900">Name</label>
        <div className="mt-1">
          <input required defaultValue={initialData?.name} type="text" name="name" id="name" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
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
