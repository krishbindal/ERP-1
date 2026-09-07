import React from 'react';
import Link from 'next/link';
import { StudentsService } from '@/services/students.service';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { verifyPageBranchContext, getAppContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { AlertCircle } from 'lucide-react';
import { SubmitButton } from './SubmitButton';

export default async function NewStudentPage(props: {
  searchParams: Promise<{ branchId?: string; error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;
  const errorMessage = searchParams.error;

  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState || !branchId || !isAuthorized) {
    return <BranchAccessError errorState={errorState || 'ACCESS_DENIED'} feature="students" />;
  }

  if (isReadOnly) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Insufficient Permissions</h2>
          <p className="mt-2 text-muted-foreground">You do not have write access to create students.</p>
        </div>
      </div>
    );
  }

  async function createStudent(formData: FormData) {
    'use server';

    const appContext = await getAppContext();
    if (!appContext) throw new Error('No authentication context');

    const orgId = appContext.type === 'normal' ? appContext.organizationId : '';
    if (!orgId) throw new Error('Organization context required');

    const { getContextBranchId } = await import('@/lib/branch-context');
    const resolvedBranchId = await getContextBranchId(explicitBranchId);

    const firstName = (formData.get('firstName') as string)?.trim();
    const lastName = (formData.get('lastName') as string)?.trim();
    const dateOfBirth = (formData.get('dateOfBirth') as string) || undefined;

    if (!firstName || !lastName) {
      const params = new URLSearchParams();
      if (explicitBranchId) params.set('branchId', explicitBranchId);
      params.set('error', 'First name and last name are required.');
      redirect(`/students/new?${params.toString()}`);
    }

    let errorToReport: string | null = null;
    try {
      const result = await StudentsService.createStudentWithPlacement(
        orgId,
        resolvedBranchId,
        {
          firstName,
          lastName,
          dateOfBirth,
        }
      );

      if ('error' in result) {
        errorToReport = result.error.message || 'Failed to enroll student';
      } else {
        const supabase = await createClient();
        const { data: profile } = await supabase
          .from('student_branch_profiles')
          .select('id')
          .eq('student_id', result.id)
          .single();

        const { data: section } = await supabase
          .from('sections')
          .select('id, class_id, academic_year_id')
          .eq('branch_id', resolvedBranchId)
          .limit(1)
          .maybeSingle();

        if (profile && section) {
          await supabase.from('enrollments').insert({
            organization_id: orgId,
            branch_id: resolvedBranchId,
            student_id: result.id,
            student_branch_profile_id: profile.id,
            academic_year_id: section.academic_year_id,
            class_id: section.class_id,
            section_id: section.id,
            status: 'ACTIVE',
            effective_from: new Date().toISOString().split('T')[0],
          });
        }

        redirect(`/students/${result.id}`);
      }
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'digest' in err &&
        typeof (err as { digest: unknown }).digest === 'string' &&
        (err as { digest: string }).digest.startsWith('NEXT_REDIRECT')
      ) {
        throw err;
      }
      errorToReport = err instanceof Error ? err.message : 'Failed to enroll student';
    }

    if (errorToReport) {
      const params = new URLSearchParams();
      if (explicitBranchId) params.set('branchId', explicitBranchId);
      params.set('error', errorToReport);
      redirect(`/students/new?${params.toString()}`);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Enroll New Student</CardTitle>
          <CardDescription>Enter student details to register and assign a branch placement.</CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold">Enrollment Failed</p>
                <p className="mt-1 text-sm text-destructive/90">{errorMessage}</p>
              </div>
            </div>
          )}

          <form
            id="enroll-student-form"
            action={createStudent}
            className="space-y-5"
          >
            <Input
              id="firstName"
              name="firstName"
              label="First Name"
              required
              placeholder="e.g. John"
              aria-invalid={errorMessage ? true : undefined}
              aria-describedby={errorMessage ? 'firstName-error' : undefined}
            />

            <Input
              id="lastName"
              name="lastName"
              label="Last Name"
              required
              placeholder="e.g. Doe"
              aria-invalid={errorMessage ? true : undefined}
              aria-describedby={errorMessage ? 'lastName-error' : undefined}
            />

            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              label="Date of Birth"
              placeholder="YYYY-MM-DD"
              aria-invalid={errorMessage ? true : undefined}
            />

            <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-3">
              <Link href="/students" className="w-full sm:w-auto">
                <Button variant="secondary" type="button" className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
                  Cancel
                </Button>
              </Link>
              <SubmitButton />
            </div>
          </form>

          
        </CardContent>
      </Card>
    </div>
  );
}



