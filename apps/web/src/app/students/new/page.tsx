import React from 'react';
import Link from 'next/link';
import { StudentsService } from '@/services/students.service'
import { redirect } from 'next/navigation'
import { verifyPageBranchContext, getAppContext } from '@/lib/branch-context';

export default async function NewStudentPage(props: { searchParams: Promise<{ branchId?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;

  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState === 'NO_CONTEXT') return <div className="text-gray-500">No context available. Please log in.</div>;
  if (errorState === 'NO_BRANCH_SELECTED') return <div className="text-gray-500">Please select a branch.</div>;
  if (errorState === 'ACCESS_DENIED' || !branchId || !isAuthorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You do not have permission to create students in this branch.</p>
        </div>
      </div>
    );
  }

  if (isReadOnly) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Insufficient Permissions</h2>
          <p className="mt-2 text-gray-600">You do not have write access to create students.</p>
        </div>
      </div>
    );
  }


  async function createStudent(formData: FormData) {
    'use server'

    const appContext = await getAppContext();
    if (!appContext) throw new Error('No authentication context');

    const orgId = appContext.type === 'normal' ? appContext.organizationId : '';
    if (!orgId) throw new Error('Organization context required');

    const { getContextBranchId } = await import('@/lib/branch-context');
    const resolvedBranchId = await getContextBranchId(explicitBranchId);

    const result = await StudentsService.createStudentWithPlacement(
      orgId,
      resolvedBranchId,
      {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        dateOfBirth: formData.get('dateOfBirth') as string || undefined,
      }
    )
    
    if ('error' in result) {
      console.error(result.error)
      return
    }
    
    redirect(`/students/${result.id}`)
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Enroll New Student</h1>
      
      <form action={createStudent} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input required type="text" name="firstName" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input required type="text" name="lastName" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input type="date" name="dateOfBirth" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
        </div>
        
        <div className="pt-4 flex justify-end space-x-3">
          <Link href="/students" className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Cancel</Link>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Create &amp; Enroll
          </button>
        </div>
      </form>
    </div>
  )
}
