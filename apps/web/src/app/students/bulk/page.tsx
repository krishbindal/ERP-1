import React from 'react';
import { verifyPageBranchContext } from '@/lib/branch-context';
import { BranchAccessError } from '@/components/BranchAccessError';
import { StudentBulkWizard } from '@/components/bulk';

export default async function StudentBulkPage(props: {
  searchParams: Promise<{ branchId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;

  const { branchId, isAuthorized, isReadOnly, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState || !branchId || !isAuthorized) {
    return <BranchAccessError errorState={errorState || 'ACCESS_DENIED'} feature="students" />;
  }

  if (isReadOnly) {
    return (
      <div className="flex items-center justify-center h-64 p-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-foreground">Insufficient Permissions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You do not have write permissions to import or enroll students into this branch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bulk Student Onboarding</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Import student rosters in bulk, map attributes, and inspect pre-flight validation before batch enrollment.
          </p>
        </div>
      </div>

      <StudentBulkWizard branchId={branchId} />
    </div>
  );
}
