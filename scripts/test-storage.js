const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables.");
  process.exit(1);
}

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
