"use client";
import { useState } from 'react';
import { BellScheduleForm } from './BellScheduleForm';
import { deleteBellSchedule } from '../actions';
import { BellSchedule } from './types';

export function BellSchedulesTable({ data, isReadOnly, explicitBranchId }: { data: BellSchedule[], isReadOnly: boolean, explicitBranchId?: string | null }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BellSchedule | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bell schedule?')) {
      try {
        const result = await deleteBellSchedule(id, explicitBranchId || undefined);
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
        <h2 className="text-lg font-medium">Bell Schedules</h2>
        {!isReadOnly && (
          <button type="button" 
            onClick={() => { setEditingItem(null); setIsDrawerOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Create Bell Schedule
          </button>
        )}
      </div>
      <div className="border border-gray-200 rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {!isReadOnly && <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 && (
              <tr>
                <td colSpan={isReadOnly ? 2 : 3} className="px-6 py-12 text-center text-gray-500">
                  No bell schedules found.
                </td>
              </tr>
            )}
            {data.map((schedule) => (
              <tr key={schedule.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{schedule.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schedule.status}</td>
                {!isReadOnly && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button type="button" onClick={() => { setEditingItem(schedule); setIsDrawerOpen(true); }} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                    <button type="button" onClick={() => handleDelete(schedule.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isDrawerOpen && (
        <BellScheduleForm 
          onClose={() => setIsDrawerOpen(false)} 
          initialData={editingItem}
          explicitBranchId={explicitBranchId || undefined}
        />
      )}
    </div>
  );
}
