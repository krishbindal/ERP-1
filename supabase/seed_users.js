const { createClient } = require('@supabase/supabase-js');

const { execSync } = require('child_process');

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  try {
    const output = execSync('npx supabase status -o json', { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const statusJson = JSON.parse(jsonMatch[0]);
      supabaseUrl = supabaseUrl || statusJson.API_URL;
      serviceRoleKey = serviceRoleKey || statusJson.SERVICE_ROLE_KEY;
    }
  } catch (e) {
    console.warn("Could not derive Supabase keys from CLI.");
  }
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const users = [
    { email: 'superadmin.e2e@test.com', password: 'password123', meta: { is_super_admin: true } },
    { email: 'admin.a.e2e@test.com', password: 'password123', meta: {} },
    { email: 'teacher.a1.e2e@test.com', password: 'password123', meta: {} },
    { email: 'guardian.e2e@test.com', password: 'password123', meta: {} },
  ];

  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: u.meta
    });
    if (error) {
      console.error('Error creating user', u.email, error.message);
    } else {
      console.log('Created user', u.email, data.user.id);
    }
  }
}

main().catch(console.error);
