const { createClient } = require('@supabase/supabase-js');

// Read config from .env or hardcode for local testing
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.XYZ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'teacher.a.e2e@test.com',
    password: 'password123'
  });
  if (signInError) {
    console.error('Sign in failed:', signInError);
    return;
  }
  
  const { data, error } = await supabase.rpc('rpc_save_attendance', {
    p_branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
    p_academic_year_id: 'aaaaaaaa-1111-1111-1111-111111111111',
    p_section_id: 'aaaaaaaa-3333-3333-3333-333333333333',
    p_date: '2026-08-10',
    p_records: []
  });
  
  console.log('RPC Error:', error);
  console.log('RPC Data:', data);
  
  const { data: perm, error: pErr } = await supabase.rpc('auth_user_has_branch_permission', {
    target_branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
    target_permission: 'attendance.session.manage'
  });
  console.log('Has Perm:', perm, pErr);
}

run();
