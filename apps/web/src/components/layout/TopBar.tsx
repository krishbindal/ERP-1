import { createClient } from '@/lib/supabase/server';
import { getCurrentAppBranch } from '@/lib/branch-context';

export async function TopBar() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const currentBranch = await getCurrentAppBranch();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {currentBranch ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
              {currentBranch.name}
            </span>
          </div>
        ) : (
          <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
            No Branch Assigned
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-gray-700 hidden sm:block">{user?.user?.email || 'User'}</div>
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
          U
        </div>
      </div>
    </header>
  );
}
