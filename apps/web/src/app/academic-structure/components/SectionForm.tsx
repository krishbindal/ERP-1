"use client";
import { useState, useEffect } from 'react';
import { createSection, updateSection, getClasses } from '../actions';
import { SectionWithClass } from './types';
import { DrawerForm } from './DrawerForm';

export function SectionForm({ onClose, initialData }: { onClose: () => void, initialData?: SectionWithClass | null }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    getClasses().then(res => {
      if (res.error) {
        setError(res.error);
      } else {
        setClasses(res.data || []);
      }
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
      capacity: parseInt(formData.get('capacity') as string, 10),
    };

    let result;
    if (initialData) {
      result = await updateSection(initialData.id, { name: data.name, capacity: data.capacity });
    } else {
      result = await createSection(data);
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
      title={`${initialData ? 'Edit' : 'New'} Section`}
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
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-900">Capacity</label>
        <div className="mt-1">
          <input required defaultValue={initialData?.capacity} type="number" name="capacity" id="capacity" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
        </div>
      </div>
      {!initialData && (
        <div>
          <label htmlFor="class_id" className="block text-sm font-medium text-gray-900">Class</label>
          <div className="mt-1">
            <select required name="class_id" id="class_id" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md">
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </DrawerForm>
  );
}
