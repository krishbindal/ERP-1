const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('http://127.0.0.1:54321', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU');
async function run() {
  const { data, error } = await supabase
    .from('branch_memberships')
    .select('branch_id, branches(name, organization_id), user_role_assignments(roles(name))')
    .limit(1);
  console.log(JSON.stringify({data, error}));
}
run();
