const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function testQuery() {
  const supabase = createClient('http://127.0.0.1:54321', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');
  
  // Login as teacher
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'teacher.a1.e2e@test.com',
    password: 'password123'
  });

  if (authErr) {
    console.error('Login failed', authErr);
    return;
  }

  console.log('Logged in as:', auth.user.email);

  // Execute the problematic query
  const branchId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02';
  const currentYearId = 'aaaaaaaa-1111-1111-1111-111111111111';

  const { data: assignments, error: assignErr } = await supabase
    .from('homework_assignments')
    .select('*, sections(name), subjects(name)')
    .eq('branch_id', branchId)
    .eq('academic_year_id', currentYearId)
    .order('due_at', { ascending: true });

  if (assignErr) {
    console.error('Query error!', assignErr);
  } else {
    console.log('Query success! Length:', assignments?.length);
    console.log('First:', assignments[0]);
  }
}

testQuery();
