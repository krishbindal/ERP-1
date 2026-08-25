import { createClient } from '@/lib/supabase/server';
import { createAndSendAnnouncement } from '../actions';

export default async function NewAnnouncementPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // simplified fetching of branch
  const { data: branches } = await supabase.from('branches').select('id, organization_id').limit(1);
  const branch = branches?.[0];
  
  if (!branch) return <div>No branch found</div>;

  return (
    <div>
      <h1>New Announcement</h1>
      <form action={createAndSendAnnouncement}>
        <input type="hidden" name="organization_id" value={branch.organization_id} />
        <input type="hidden" name="branch_id" value={branch.id} />
        
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
