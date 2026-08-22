/**
 * Shared branch access error component.
 * Used by pages that call verifyPageBranchContext() to render
 * consistent error states for unauthorized or missing context.
 */
export function BranchAccessError({ errorState, feature }: { errorState: string; feature: string }) {
  if (errorState === 'NO_CONTEXT') return <div className="text-gray-500">No context available. Please log in.</div>;
  if (errorState === 'NO_BRANCH_SELECTED') return <div className="text-gray-500">Please select a branch to view {feature}.</div>;
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-600">You do not have permission to view this branch&apos;s {feature}.</p>
      </div>
    </div>
  );
}
