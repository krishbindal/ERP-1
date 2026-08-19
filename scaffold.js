const fs = require('fs');
const path = require('path');

const write = (filepath, content) => {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n');
};

write('apps/web/src/app/academic-structure/page.tsx', `
import { AcademicYearsTable } from './components/AcademicYearsTable';
import { ClassesTable } from './components/ClassesTable';
import { SectionsTable } from './components/SectionsTable';

export default function AcademicStructurePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Academic Structure</h1>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <a href="#" className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Academic Years</a>
          <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Classes</a>
          <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Sections</a>
        </nav>
      </div>
      <div>
        <AcademicYearsTable />
      </div>
    </div>
  );
}
`);

write('apps/web/src/app/academic-structure/components/AcademicYearsTable.tsx', `
import { useState } from 'react';
import { AcademicYearForm } from './AcademicYearForm';

export function AcademicYearsTable() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Academic Years</h2>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Create Academic Year
        </button>
      </div>
      <div className="border border-gray-200 rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2026-2027</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2026-06-01</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2027-05-31</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href="#" className="text-blue-600 hover:text-blue-900">Edit</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {isDrawerOpen && (
        <AcademicYearForm onClose={() => setIsDrawerOpen(false)} />
      )}
    </div>
  );
}
`);

write('apps/web/src/app/academic-structure/components/AcademicYearForm.tsx', `
export function AcademicYearForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full divide-y divide-gray-200 flex flex-col bg-white shadow-xl">
              <div className="flex-1 h-0 overflow-y-auto">
                <div className="py-6 px-4 bg-blue-700 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-white">New Academic Year</h2>
                    <button onClick={onClose} className="text-blue-200 hover:text-white">Close</button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="px-4 divide-y divide-gray-200 sm:px-6">
                    <div className="space-y-6 pt-6 pb-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-900">Name</label>
                        <div className="mt-1">
                          <input type="text" name="name" id="name" className="block w-full shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 px-4 py-4 flex justify-end">
                <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">Cancel</button>
                <button type="submit" className="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">Save</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
`);

console.log("Scaffold complete");
