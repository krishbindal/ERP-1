const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL || 'http://127.0.0.1:54321', process.env.SUPABASE_ANON_KEY || 'dummy', { auth: { persistSession: false } });

async function test() {
  const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
  // I need to use the REST API or two supabase clients to hold two sessions independently.
}
test();
