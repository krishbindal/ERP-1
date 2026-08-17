import React from 'react';
import { StudentsService } from '@/services/students.service'
import Link from 'next/link'

export default async function StudentsPage() {
  const { data: students, error } = await StudentsService.listStudents()

  if (error) {
    return <div className="p-4 text-red-500">Error loading students: {error.message}</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <Link href="/students/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Add Student
        </Link>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students?.map(student => (
              <tr key={student.id}>
                <td className="px-6 py-4">
                  {student.first_name} {student.last_name}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/students/${student.id}`} className="text-blue-600 hover:text-blue-900">View</Link>
                </td>
              </tr>
            ))}
            {(!students || students.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No students found in your active branches.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
