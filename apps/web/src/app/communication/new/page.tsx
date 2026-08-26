import { createClient } from '@/lib/supabase/server';
import { createAndSendAnnouncement } from '../actions';
import { getAppContext } from '@/lib/branch-context';

export default async function NewAnnouncementPage() {
  const supabase = await createClient();
  const context = await getAppContext();
  
  if (!context?.branchId) return <div>No branch context found</div>;

  return (
    <div>
      <h1>New Announcement</h1>
      <form action={createAndSendAnnouncement}>
        <input type="hidden" name="organization_id" value={context.organizationId!} />
        <input type="hidden" name="branch_id" value={context.branchId} />
        
        <div>
          <label>Subject</label>
          <input name="subject" required />
        </div>
        
        <div>
          <label>Content</label>
          <textarea name="content" required />
        </div>
        
        <div>
          <label>Target Type</label>
          <select name="target_type">
            <option value="BRANCH">Branch</option>
            <option value="SECTION">Section</option>
          </select>
        </div>
        
        <div>
          <label>Target ID (if section)</label>
          <input name="target_id" placeholder="UUID" />
        </div>
        
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
