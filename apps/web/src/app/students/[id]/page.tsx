import React from 'react';
import { StudentsService } from '@/services/students.service'
import Link from 'next/link'
import { verifyPageBranchContext } from '@/lib/branch-context';

export default async function StudentDetailPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ branchId?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;

  const { branchId, isAuthorized, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState === 'NO_CONTEXT') return <div className="text-gray-500">No context available. Please log in.</div>;
  if (errorState === 'NO_BRANCH_SELECTED') return <div className="text-gray-500">Please select a branch.</div>;
  if (errorState === 'ACCESS_DENIED' || !branchId || !isAuthorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You do not have permission to view this student.</p>
        </div>
      </div>
    );
  }

  const { data: student, error } = await StudentsService.getStudent(params.id)

  if (error || !student) {
    return <div className="p-8 text-red-600">Student not found or access denied.</div>
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Details</h1>
        <Link href="/students" className="text-blue-600 hover:underline">Back to List</Link>
      </div>

      <div className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Profile Information</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">First Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.first_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.last_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
            <dd className="mt-1 text-sm text-gray-900">{student.date_of_birth || 'Not provided'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {student.status}
              </span>
            </dd>
          </div>
        </dl>
      </div>
      
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Guardians</h2>
        <p className="text-sm text-gray-500 mb-4">
          Guardian linking UI placeholder.
        </p>
        <button className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 text-sm">
          Link Guardian
        </button>
      </div>
    </div>
  )
}
