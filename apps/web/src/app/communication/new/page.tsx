import { getAppContext } from '@/lib/branch-context';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CommunicationForm } from './CommunicationForm';
import { createAndSendAnnouncement } from '../actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewAnnouncementPage() {
  const context = await getAppContext();
  if (!context) redirect('/login');

  const isAdmin = context.roles.includes('branchadmin') || context.roles.includes('superadmin');
  const isTeacher = context.roles.includes('teacher');

  if (!isAdmin && !isTeacher) {
    redirect('/communication');
  }

  const branchId = 'branchId' in context ? context.branchId : null;
  if (!branchId) redirect('/communication');

  const supabase = await createClient();
  const { data: targets, error } = await supabase.rpc('rpc_get_communication_targets', {
    p_branch_id: branchId
  });

  if (error || !targets || targets.length === 0) {
    // If no targets available, they can't send messages
    return (
      <div className="p-8 max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">New Message</h1>
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          You are not authorized to send messages to any targets.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">New Message</h1>
      <CommunicationForm targets={targets} createAction={createAndSendAnnouncement} />
    </div>
  );
}
