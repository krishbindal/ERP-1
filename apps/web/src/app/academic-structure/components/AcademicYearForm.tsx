"use client";
import { useState } from 'react';
import { createAcademicYear, updateAcademicYear } from '../actions';

export function AcademicYearForm({ onClose, branchId, initialData }: { onClose: () => void, branchId: string, initialData?: any }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      branch_id: branchId,
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
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <form onSubmit={handleSubmit} className="h-full divide-y divide-gray-200 flex flex-col bg-white shadow-xl">
              <div className="flex-1 h-0 overflow-y-auto">
                <div className="py-6 px-4 bg-blue-700 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-white">{initialData ? 'Edit' : 'New'} Academic Year</h2>
                    <button type="button" onClick={onClose} className="text-blue-200 hover:text-white">Close</button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="px-4 divide-y divide-gray-200 sm:px-6">
                    <div className="space-y-6 pt-6 pb-5">
                      {error && <div className="text-red-600 text-sm">{error}</div>}
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
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 px-4 py-4 flex justify-end">
                <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">Cancel</button>
                <button disabled={loading} type="submit" className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">Save</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
