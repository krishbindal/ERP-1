import { createClient } from '@/lib/supabase/server';
import { getCurrentAppBranch } from '@/lib/branch-context';
import { getBranchAppConfig } from './actions';
import { AppConfigForm } from './components/AppConfigForm';

export default async function AppConfigPage() {
  const supabase = await createClient();
  const currentBranch = await getCurrentAppBranch();
  const branchId = currentBranch?.id;

  if (!branchId) {
    return <div className="text-gray-500">No branch context. Ensure you are accessing a valid branch application.</div>;
  }

  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError || !user?.user) {
    return <div className="text-red-500">Authentication required.</div>;
  }

  // Explicitly check for Super Admin or Branch Admin role
  const isSuperAdmin = user.user.app_metadata?.is_super_admin === true;

  let isBranchAdmin = false;
  if (!isSuperAdmin) {
    const { data: branchMembership } = await supabase
      .from('branch_memberships')
      .select('id, user_role_assignments!inner(roles!inner(name))')
      .eq('user_id', user.user.id)
      .eq('branch_id', branchId)
      .eq('user_role_assignments.roles.name', 'Branch Admin')
      .maybeSingle();
      
    isBranchAdmin = !!branchMembership;
  }

  if (!isSuperAdmin && !isBranchAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You do not have permission to view or manage branch app configurations.</p>
        </div>
      </div>
    );
  }

  const { data: appConfig, error } = await getBranchAppConfig();

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
          Manage the mobile app configuration for {currentBranch.name}.
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <AppConfigForm initialData={appConfig} />
        </div>
      </div>
    </div>
  );
}
