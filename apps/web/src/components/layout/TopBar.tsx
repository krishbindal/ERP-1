import { createClient } from '@/lib/supabase/server';
import BranchSelector from '../BranchSelector';
import { cookies } from 'next/headers';

export async function TopBar() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const { data: branches } = await supabase.from('branches').select('id, name');
  
  const cookieStore = await cookies();
  const currentBranchId = cookieStore.get('active_branch_id')?.value || '';

  // Auto-set the active branch if not set, but since we can't mutate cookies easily in render, 
  // the client component can handle it.

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {branches && branches.length > 0 ? (
          <BranchSelector branches={branches} currentBranchId={currentBranchId} />
        ) : (
          <span className="text-gray-500">No Branches</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-gray-700">{user?.user?.email || 'User'}</div>
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
          U
        </div>
      </div>
    </header>
  );
}
