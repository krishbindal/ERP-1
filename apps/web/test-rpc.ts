import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('rpc_get_communication_targets', {
    p_branch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02'
  });
  console.log('Error:', error);
  console.log('Data:', data);
}
run();
