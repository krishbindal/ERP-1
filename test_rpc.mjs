import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: branches } = await supabase.from('branches').select('id').limit(1);
  const branchId = branches[0].id;

  const { data, error } = await supabase.rpc('rpc_get_communication_targets', {
    p_branch_id: branchId
  });

  console.log('Error:', error);
  console.log('Data:', data);
}
run();
