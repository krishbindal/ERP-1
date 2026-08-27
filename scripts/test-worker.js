const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

// Derive the local service key and URL dynamically
let statusJson;
try {
  const output = execSync('npx supabase status -o json', { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
  // Supabase CLI sometimes outputs warning lines before JSON. We need to extract the JSON object.
  const jsonMatch = output.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in output");
  statusJson = JSON.parse(jsonMatch[0]);
} catch (error) {
  console.error("Failed to run supabase status. Ensure Supabase is running.");
  process.exit(1);
}

const supabaseUrl = statusJson.API_URL;
const supabaseKey = statusJson.SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Could not parse API_URL or SERVICE_ROLE_KEY from supabase status.");
  process.exit(1);
}

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
  if (res.status !== 200) throw new Error(`3. Expected 200, got ${res.status}`);
  
  let data = await res.json();
  console.log('Worker Certification Passed!');
}

runTests().catch(e => { console.error(e); process.exit(1); });
