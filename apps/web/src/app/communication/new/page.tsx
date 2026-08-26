import { getAppContext } from '@/lib/branch-context';
import { createAndSendAnnouncement } from '../actions';
import { redirect } from 'next/navigation';

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

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">New Message</h1>

      <form action={createAndSendAnnouncement} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">To</label>
          <select name="target_type" className="w-full border rounded-md p-2">
            <option value="BRANCH">Entire Branch</option>
            {isTeacher && <option value="CLASS">My Classes</option>}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Subject</label>
          <input type="text" name="subject" required className="w-full border rounded-md p-2" />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Message</label>
          <textarea name="content" required rows={5} className="w-full border rounded-md p-2"></textarea>
        </div>

        <div className="flex justify-end space-x-4">
          <a href="/communication" className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</a>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
}
