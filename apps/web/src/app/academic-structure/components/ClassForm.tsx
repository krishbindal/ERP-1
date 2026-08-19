"use client";
import { useState, useEffect } from 'react';
import { createClass, updateClass, getAcademicYears } from '../actions';
import { ClassWithYear } from './types';
import { DrawerForm } from './DrawerForm';

export function ClassForm({ onClose, initialData, explicitBranchId }: { onClose: () => void, initialData?: ClassWithYear | null }) {
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
        result = await updateClass(initialData.id, { name: data.name, level: data.level }, explicitBranchId);
      } else {
        result = await createClass(data, explicitBranchId);
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
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900">Name</label>
        <div className="mt-1">
          <input required defaultValue={initialData?.name} type="text" name="name" id="name" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
        </div>
      </div>
      <div>
        <label htmlFor="level" className="block text-sm font-medium text-gray-900">Level (Integer)</label>
        <div className="mt-1">
          <input required defaultValue={initialData?.level} type="number" name="level" id="level" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
        </div>
      </div>
      {!initialData && (
        <div>
          <label htmlFor="academic_year_id" className="block text-sm font-medium text-gray-900">Academic Year</label>
          <div className="mt-1">
            <select required name="academic_year_id" id="academic_year_id" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md">
              {academicYears.map(ay => (
                <option key={ay.id} value={ay.id}>{ay.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </DrawerForm>
  );
}





