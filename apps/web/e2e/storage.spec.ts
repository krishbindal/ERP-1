import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

let SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
let SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE) {
  try {
    const output = execSync('npx supabase status -o json', { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const statusJson = JSON.parse(jsonMatch[0]);
      SUPABASE_URL = SUPABASE_URL || statusJson.API_URL;
      SUPABASE_ANON_KEY = SUPABASE_ANON_KEY || statusJson.ANON_KEY;
      SERVICE_ROLE = SERVICE_ROLE || statusJson.SERVICE_ROLE_KEY;
    }
  } catch (e) {
    console.warn("Could not derive Supabase keys from CLI. E2E tests may fail if env vars are missing.");
  }
}

test.describe('Storage Runtime Authorization (Communication)', () => {
  let supabase: ReturnType<typeof createClient>;
  let adminClient: ReturnType<typeof createClient>;
  let messageId: string;

  test.beforeAll(async () => {
    supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    adminClient = createClient(SUPABASE_URL!, SERVICE_ROLE!);
  });

  test('Teacher can upload attachment to their own draft and unauthorized users cannot read', async () => {
    // 1. Login as Teacher A
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email: 'teacher.a1.e2e@test.com',
      password: 'password123'
    });
    expect(error).toBeNull();
    
    // 2. Create a Draft Message via Admin Client (bypass rpc_create_message checks)
    const branch_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02';
    const org_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01';
    
    const { data: msg, error: msgErr } = await adminClient.from('communication_messages').insert({
      organization_id: org_id,
      branch_id: branch_id,
      sender_id: user!.id,
      subject: 'Test Attachment',
      body: 'This is a test',
      status: 'DRAFT',
      type: 'ANNOUNCEMENT'
    } as never).select('id').single();
    
    expect(msgErr).toBeNull();
    messageId = (msg as unknown as { id: string }).id;

    // 3. Upload file to {messageId}/test.txt
    const fileName = `${messageId}/test.txt`;
    const fileBody = 'Hello Storage';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('communication_assets')
      .upload(fileName, fileBody, { contentType: 'text/plain' });
      
    expect(uploadError).toBeNull();
    expect(uploadData!.path).toBe(fileName);

    // 4. Download file as same user (should succeed)
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('communication_assets')
      .download(fileName);
    expect(downloadError).toBeNull();
    const text = await downloadData!.text();
    expect(text).toBe(fileBody);

    // 5. Login as another Teacher and try to download
    await supabase.auth.signInWithPassword({
      email: 'admin.a.e2e@test.com', // Actually Admin A, who is not the sender
      password: 'password123'
    });
    
    const { error: downloadError2 } = await supabase.storage
      .from('communication_assets')
      .download(fileName);
      
    // Should fail because Admin A is neither sender nor recipient
    expect(downloadError2).not.toBeNull();
  });
});
