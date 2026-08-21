import {  verifyPageBranchContext } from '@/lib/branch-context';
import { getBranchAppConfig } from './actions';
import { AppConfigForm } from './components/AppConfigForm';

export default async function AppConfigPage(props: { searchParams: Promise<{ branchId?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;

    const { branchId, isAuthorized, errorState } = await verifyPageBranchContext(explicitBranchId);

  if (errorState === 'NO_CONTEXT') return <div className="text-gray-500">No context available.</div>;
  if (errorState === 'NO_BRANCH_SELECTED') return <div className="text-gray-500">Please select a branch to view its app config.</div>;
  if (errorState === 'ACCESS_DENIED' || !branchId || !isAuthorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You do not have permission to view this branch&apos;s app config.</p>
        </div>
      </div>
    );
  }

  const { data: appConfig, error } = await getBranchAppConfig(branchId);

  if (error) {
    return <div className="text-red-500">Error loading configuration: {error}</div>;
  }

  if (!appConfig) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Not Found</h2>
          <p className="mt-2 text-gray-600">App configuration not found for this branch.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Branch App Configuration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the mobile app configuration for this branch.
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <AppConfigForm initialData={appConfig} explicitBranchId={branchId} />
        </div>
      </div>
    </div>
  );
}

