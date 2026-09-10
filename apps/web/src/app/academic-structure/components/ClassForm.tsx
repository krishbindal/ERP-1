"use client";
import { useState, useEffect } from 'react';
import { createClass, updateClass, getAcademicYears } from '../actions';
import { ClassWithYear } from './types';
import { DrawerForm } from './DrawerForm';
import { Input, Select } from '@/components/ui';

export function ClassForm({ onClose, initialData, explicitBranchId }: { onClose: () => void, explicitBranchId?: string | null, initialData?: ClassWithYear | null }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    getAcademicYears()
      .then(res => {
        if (res.error) {
          setError(res.error);
        } else {
          setAcademicYears(res.data || []);
        }
      })
      .catch(err => {
        setError(err instanceof Error ? (err as Error).message : 'Failed to fetch academic years.');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      academic_year_id: formData.get('academic_year_id') as string,
      name: formData.get('name') as string,
      level: Number.parseInt(formData.get('level') as string, 10),
    };

    try {
      let result;
      if (initialData) {
        result = await updateClass(initialData.id, { name: data.name, level: data.level }, explicitBranchId || undefined);
      } else {
        result = await createClass(data, explicitBranchId || undefined);
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
      title={`${initialData ? 'Edit' : 'New'} Class`}
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
          placeholder="e.g. Grade 1"
        />
        <Input
          required
          defaultValue={initialData?.level}
          type="number"
          name="level"
          id="level"
          label="Level (Integer)"
          placeholder="e.g. 1"
        />
        {!initialData && (
          <Select
            required
            name="academic_year_id"
            id="academic_year_id"
            label="Academic Year"
            options={academicYears.map(ay => ({ value: ay.id, label: ay.name }))}
          />
        )}
      </div>
    </DrawerForm>
  );
}





