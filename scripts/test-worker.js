const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log('Starting Worker Runtime Certification...');
  
  let res = await fetch(supabaseUrl + '/functions/v1/communication-worker', { method: 'GET' });
  if (res.status !== 405) throw new Error('1. Expected 405');
  
  res = await fetch(supabaseUrl + '/functions/v1/communication-worker', { method: 'POST' });
  if (res.status !== 401) throw new Error('2. Expected 401');
  
  res = await fetch(supabaseUrl + '/functions/v1/communication-worker', { 
    method: 'POST', 
    headers: { 'Authorization': 'Bearer ' + supabaseKey } 
  });
  if (res.status !== 200) throw new Error('3. Expected 200');
  
  let data = await res.json();
  console.log('Worker Certification Passed!');
}

runTests().catch(e => { console.error(e); process.exit(1); });
