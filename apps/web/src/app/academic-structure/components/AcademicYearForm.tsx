"use client";
import { useState } from 'react';
import { createAcademicYear, updateAcademicYear } from '../actions';
import { AcademicYear } from './types';
import { DrawerForm } from './DrawerForm';

export function AcademicYearForm({ onClose, initialData }: { onClose: () => void, initialData?: AcademicYear | null }) {
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

    let result;
    if (initialData) {
      result = await updateAcademicYear(initialData.id, data);
    } else {
      result = await createAcademicYear(data);
    }

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onClose();
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
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900">Name</label>
        <div className="mt-1">
          <input required defaultValue={initialData?.name} type="text" name="name" id="name" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
        </div>
      </div>
      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-gray-900">Start Date</label>
        <div className="mt-1">
          <input required defaultValue={initialData?.start_date} type="date" name="start_date" id="start_date" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
        </div>
      </div>
      <div>
        <label htmlFor="end_date" className="block text-sm font-medium text-gray-900">End Date</label>
        <div className="mt-1">
          <input required defaultValue={initialData?.end_date} type="date" name="end_date" id="end_date" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
        </div>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-900">Status</label>
        <div className="mt-1">
          <select required defaultValue={initialData?.status || 'PLANNED'} name="status" id="status" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md">
            <option value="PLANNED">Planned</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>
    </DrawerForm>
  );
}
