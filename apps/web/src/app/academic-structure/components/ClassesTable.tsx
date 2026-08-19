"use client";
import { useState } from 'react';
import { ClassForm } from './ClassForm';
import { deleteClass } from '../actions';
import { ClassWithYear } from './types';

export function ClassesTable({ data, isReadOnly }: { data: ClassWithYear[], isReadOnly: boolean }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassWithYear | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this class?')) {
      try {
        const result = await deleteClass(id);
        if (result.error) {
          alert(result.error);
        }
      } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('An unexpected error occurred during deletion.');
      }
    }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Classes</h2>
        {!isReadOnly && (
          <button 
            onClick={() => { setEditingItem(null); setIsDrawerOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Create Class
          </button>
        )}
      </div>
      <div className="border border-gray-200 rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
              {!isReadOnly && <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 && (
              <tr>
                <td colSpan={isReadOnly ? 3 : 4} className="px-6 py-12 text-center text-gray-500">
                  No classes found.
                </td>
              </tr>
            )}
            {data.map((cls) => (
              <tr key={cls.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.academic_years?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.level}</td>
                {!isReadOnly && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => { setEditingItem(cls); setIsDrawerOpen(true); }} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                    <button onClick={() => handleDelete(cls.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isDrawerOpen && (
        <ClassForm 
          onClose={() => setIsDrawerOpen(false)} 
          initialData={editingItem}
        />
      )}
    </div>
  );
}



