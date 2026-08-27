const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
// Test tokens retrieved from seed.sql / auth.users
// Normally we'd use the test tokens or create a mock JWT.
// Let's create a JWT for a teacher and a student if we can, or just use anon key to see if it fails.

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const anonClient = createClient(supabaseUrl, anonKey);

async function testStorage() {
  console.log("Testing unauthorized upload...");
  const res1 = await anonClient.storage.from('communication_assets').upload('test.txt', 'hello');
  if (!res1.error) throw new Error("Expected unauthorized upload to fail!");
  console.log("Unauthorized upload denied:", res1.error.message);

  console.log("Testing unauthorized download...");
  const res2 = await anonClient.storage.from('communication_assets').download('test.txt');
  if (!res2.error) throw new Error("Expected unauthorized download to fail!");
  console.log("Unauthorized download denied:", res2.error.message);

  console.log("Storage API runtime test PASSED (basic isolation).");
}

testStorage().catch(e => {
  console.error(e);
  process.exit(1);
});
