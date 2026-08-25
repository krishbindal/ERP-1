import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

test.describe('Storage Runtime Authorization (Communication)', () => {
  let supabase: any;
  let adminClient: any;
  let messageId: string;

  test.beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    adminClient = createClient(SUPABASE_URL, SERVICE_ROLE);
  });

  test('Teacher can upload attachment to their own draft and unauthorized users cannot read', async () => {
    // 1. Login as Teacher A
    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email: 'teacher.a1.e2e@test.com',
      password: 'password123'
    });
    expect(error).toBeNull();
    
    // 2. Create a Draft Message via Admin Client (bypass rpc_create_message checks)
    const { data: staffProfiles } = await adminClient.from('staff_branch_profiles').select('branch_id').eq('staff_id', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee22').limit(1);
    const branch_id = staffProfiles[0].branch_id;
    const { data: orgs } = await adminClient.from('branches').select('organization_id').eq('id', branch_id).limit(1);
    
    const { data: msg, error: msgErr } = await adminClient.from('communication_messages').insert({
      organization_id: orgs[0].organization_id,
      branch_id: branch_id,
      sender_id: user.id,
      subject: 'Test Attachment',
      body: 'This is a test',
      status: 'DRAFT',
      type: 'ANNOUNCEMENT'
    }).select('id').single();
    
    expect(msgErr).toBeNull();
    messageId = msg.id;

    // 3. Upload file to {messageId}/test.txt
    const fileName = `${messageId}/test.txt`;
    const fileBody = 'Hello Storage';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('communication_assets')
      .upload(fileName, fileBody, { contentType: 'text/plain' });
      
    expect(uploadError).toBeNull();
    expect(uploadData.path).toBe(fileName);

    // 4. Download file as same user (should succeed)
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('communication_assets')
      .download(fileName);
    expect(downloadError).toBeNull();
    const text = await downloadData.text();
    expect(text).toBe(fileBody);

    // 5. Login as another Teacher and try to download
    const { data: otherUser } = await supabase.auth.signInWithPassword({
      email: 'admin.a.e2e@test.com', // Actually Admin A, who is not the sender
      password: 'password123'
    });
    
    const { data: downloadData2, error: downloadError2 } = await supabase.storage
      .from('communication_assets')
      .download(fileName);
      
    // Should fail because Admin A is neither sender nor recipient
    expect(downloadError2).not.toBeNull();
  });
});
