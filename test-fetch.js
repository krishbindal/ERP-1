const { createClient } = require('@supabase/supabase-js');

async function testFetch() {
  const supabase = createClient('http://127.0.0.1:54322', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0');
  
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
  const token = auth.session.access_token;

  // Make direct fetch to postgREST
  const res = await fetch('http://127.0.0.1:54322/rest/v1/homework_assignments?select=*%2Csections(name)%2Csubjects(name)&branch_id=eq.eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
      'Authorization': `Bearer ${token}`
    }
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

testFetch();
