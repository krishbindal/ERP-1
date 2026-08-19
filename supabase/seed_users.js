const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const users = [
    { email: 'superadmin@test.com', password: 'password123', meta: { is_super_admin: true } },
    { email: 'admin.a@test.com', password: 'password123', meta: {} },
    { email: 'teacher.a1@test.com', password: 'password123', meta: {} },
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
