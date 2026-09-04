import React from 'react';
import { StudentsService } from '@/services/students.service'
import Link from 'next/link'
import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { StudentsTable } from './components/StudentsTable';

export default async function StudentsPage(props: { searchParams: Promise<{ branchId?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;

  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState || !branchId || !isAuthorized) {
    return <BranchAccessError errorState={errorState || 'ACCESS_DENIED'} feature="students" />;
  }

  const { data: students, error } = await StudentsService.listStudents()

  if (error) {
    return <div className="p-4 text-red-500">Error loading students: {error.message}</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        {!isReadOnly && (
          <Link href={`/students/new${branchId ? `?branchId=${branchId}` : ''}`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Student
          </Link>
        )}
      </div>

      <StudentsTable students={students || []} />
    </div>
  )
}

