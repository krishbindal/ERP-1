import React from 'react';
import { StudentsService } from '@/services/students.service'
import Link from 'next/link'
import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default async function StudentDetailPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ branchId?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;

  const { branchId, isAuthorized, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState || !branchId || !isAuthorized) {
    return <BranchAccessError errorState={errorState || 'ACCESS_DENIED'} feature="students" />;
  }

  const { data: student, error } = await StudentsService.getStudent(params.id)

  if (error || !student) {
    return <div className="p-8 text-red-600">Student not found or access denied.</div>
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Student Details</h1>
        <Link
          href="/students"
          className="min-h-[44px] inline-flex items-center text-primary hover:underline text-sm font-medium gap-1"
        >
          Back to List
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">First Name</dt>
              <dd className="mt-1 text-sm text-foreground">{student.first_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Last Name</dt>
              <dd className="mt-1 text-sm text-foreground">{student.last_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
              <dd className="mt-1 text-sm text-foreground">{student.date_of_birth || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <Badge variant={student.status === 'ACTIVE' ? 'success' : 'default'}>
                  {student.status}
                </Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Guardians</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Guardian linking UI placeholder.
          </p>
          <button className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted text-sm font-medium">
            Link Guardian
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
