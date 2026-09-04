"use client";
import { useState, useEffect } from 'react';
import { createSection, updateSection, getClasses } from '../actions';
import { SectionWithClass } from './types';
import { DrawerForm } from './DrawerForm';
import { Input, Select } from '@/components/ui';

export function SectionForm({ onClose, initialData, explicitBranchId }: { onClose: () => void, explicitBranchId?: string | null, initialData?: SectionWithClass | null }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    getClasses()
      .then(res => {
        if (res.error) {
          setError(res.error);
        } else {
          setClasses(res.data || []);
        }
      })
      .catch(err => {
        setError(err instanceof Error ? (err as Error).message : 'Failed to fetch classes.');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      class_id: formData.get('class_id') as string,
      name: formData.get('name') as string,
      capacity: Number.parseInt(formData.get('capacity') as string, 10),
    };

    try {
      let result;
      if (initialData) {
        result = await updateSection(initialData.id, { name: data.name, capacity: data.capacity }, explicitBranchId || undefined);
      } else {
        result = await createSection(data, explicitBranchId || undefined);
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
      title={`${initialData ? 'Edit' : 'New'} Section`}
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
          placeholder="e.g. Section A"
        />
        <Input
          required
          defaultValue={initialData?.capacity}
          type="number"
          name="capacity"
          id="capacity"
          label="Capacity"
          placeholder="e.g. 30"
        />
        {!initialData && (
          <Select
            required
            name="class_id"
            id="class_id"
            label="Class"
            options={classes.map(cls => ({ value: cls.id, label: cls.name }))}
          />
        )}
      </div>
    </DrawerForm>
  );
}





