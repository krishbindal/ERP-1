"use client";
import { useState } from 'react';
import { createAcademicYear, updateAcademicYear } from '../actions';
import { AcademicYear } from './types';
import { DrawerForm } from './DrawerForm';
import { Input, Select } from '@/components/ui';

export function AcademicYearForm({ onClose, initialData, explicitBranchId }: { onClose: () => void; initialData?: AcademicYear | null; explicitBranchId?: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      status: formData.get('status') as string,
    };

    try {
      let result;
      if (initialData) {
        result = await updateAcademicYear(initialData.id, data, explicitBranchId || undefined);
      } else {
        result = await createAcademicYear(data, explicitBranchId || undefined);
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
      title={`${initialData ? 'Edit' : 'New'} Academic Year`}
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
          placeholder="e.g. AY 2026-2027"
        />
        <Input
          required
          defaultValue={initialData?.start_date}
          type="date"
          name="start_date"
          id="start_date"
          label="Start Date"
        />
        <Input
          required
          defaultValue={initialData?.end_date}
          type="date"
          name="end_date"
          id="end_date"
          label="End Date"
        />
        <Select
          required
          defaultValue={initialData?.status || 'PLANNED'}
          name="status"
          id="status"
          label="Status"
          options={[
            { value: 'PLANNED', label: 'Planned' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'ARCHIVED', label: 'Archived' },
          ]}
        />
      </div>
    </DrawerForm>
  );
}





