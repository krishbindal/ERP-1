import React from 'react';
import { StudentsService } from '@/services/students.service';
import Link from 'next/link';
import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { StudentsTable } from './components/StudentsTable';
import { Button } from '@/components/ui/Button';
import { AcademicSessionSelector } from '@/components/AcademicSessionSelector';
import { createClient } from '@/lib/supabase/server';

export default async function StudentsPage(props: { searchParams: Promise<{ branchId?: string; session?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const sessionId = searchParams.session;

  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState || !branchId || !isAuthorized) {
    return <BranchAccessError errorState={errorState || 'ACCESS_DENIED'} feature="students" />;
  }

  const supabase = await createClient();

  // Fetch all years for the selector
  const { data: years, error: yearsError } = await supabase
    .from('academic_years')
    .select('*')
    .eq('branch_id', branchId)
    .order('start_date', { ascending: false });

  if (yearsError) {
    return <div className="p-4 text-red-500">Error loading academic sessions: {yearsError.message}</div>;
  }

  if (sessionId && years) {
    if (!years.some(y => y.id === sessionId)) {
      return <div className="p-4 text-red-500">Invalid or cross-branch academic session selected.</div>;
    }
  }

  let students: import('./components/StudentsTable').StudentItem[] = [];
  if (sessionId) {
    const { data, error } = await StudentsService.listStudents(branchId, sessionId);
    if (error) {
      return <div className="p-4 text-red-500">Error loading students: {error.message}</div>;
    }
    students = data || [];
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        
        <AcademicSessionSelector years={years || []} currentSessionId={sessionId} branchId={branchId} />
        
        {!isReadOnly && (
          <div className="flex items-center gap-3 ml-4">
            <Link href={'/students/bulk' + (branchId ? '?branchId='+branchId : '')}>
              <Button variant="outline">Bulk Import</Button>
            </Link>
            <Link href={'/students/new' + (branchId ? '?branchId='+branchId : '')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Add Student
            </Link>
          </div>
        )}
      </div>

      {!sessionId ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded border border-gray-200">
          Please select an Academic Session above to view enrolled students.
        </div>
      ) : (
        <StudentsTable students={students} />
      )}
    </div>
  );
}



