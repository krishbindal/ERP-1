"use client";
import { useState } from 'react';
import { PeriodForm } from './PeriodForm';
import { deletePeriod } from '../actions';
import { Period, BellSchedule } from './types';

export function PeriodsTable({ data, schedules, isReadOnly, explicitBranchId }: { data: Period[], schedules: BellSchedule[], isReadOnly: boolean, explicitBranchId?: string | null }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Period | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this period?')) {
      try {
        const result = await deletePeriod(id, explicitBranchId || undefined);
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
        <h2 className="text-lg font-medium">Periods</h2>
        {!isReadOnly && (
          <button type="button" 
            onClick={() => { setEditingItem(null); setIsDrawerOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Create Period
          </button>
        )}
      </div>
      <div className="border border-gray-200 rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bell Schedule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {!isReadOnly && <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 && (
              <tr>
                <td colSpan={isReadOnly ? 5 : 6} className="px-6 py-12 text-center text-gray-500">
                  No periods found.
                </td>
              </tr>
            )}
            {data.map((period) => (
              <tr key={period.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{period.bell_schedules?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{period.start_time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{period.end_time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{period.status}</td>
                {!isReadOnly && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button type="button" onClick={() => { setEditingItem(period); setIsDrawerOpen(true); }} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                    <button type="button" onClick={() => handleDelete(period.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {isDrawerOpen && (
        <PeriodForm 
          onClose={() => setIsDrawerOpen(false)} 
          initialData={editingItem}
          schedules={schedules}
          explicitBranchId={explicitBranchId || undefined}
        />
      )}
    </div>
  );
}
