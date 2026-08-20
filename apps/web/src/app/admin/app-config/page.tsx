import { createClient } from '@/lib/supabase/server';
import { getAppContext, auth_has_org_access } from '@/lib/branch-context';
import { getBranchAppConfig } from './actions';
import { AppConfigForm } from './components/AppConfigForm';

export default async function AppConfigPage(props: { searchParams: Promise<{ branchId?: string }> }) {
  const searchParams = await props.searchParams;
  const explicitBranchId = searchParams.branchId;

  const supabase = await createClient();
  const context = await getAppContext();
  
  if (!context) {
    return <div className="text-gray-500">No context available.</div>;
  }

  const branchId = context.type === 'normal' ? context.branchId : explicitBranchId;

  if (!branchId) {
    if (context.type === 'superadmin') {
      return <div className="text-gray-500">Please select a branch to view its configuration.</div>;
    }
    return <div className="text-gray-500">No branch context. Ensure you are accessing a valid branch application.</div>;
  }

  // Authorize Super Admin cross-branch access
  let isAuthorized = false;
  let branchName = 'Unknown Branch';

  if (context.type === 'superadmin') {
    const { data: branch } = await supabase.from('branches').select('name, organization_id').eq('id', branchId).single();
    if (branch && auth_has_org_access(context, branch.organization_id)) {
      isAuthorized = true;
      branchName = branch.name;
    }
  } else if (context.type === 'normal') {
    if (explicitBranchId && explicitBranchId !== context.branchId) {
      return <div className="text-red-500">You are not authorized to view this branch.</div>;
    }
    isAuthorized = context.roles.includes('branchadmin');
    branchName = context.branchName;
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You do not have permission to view or manage branch app configurations.</p>
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
          Manage the mobile app configuration for {branchName}.
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
