const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('http://127.0.0.1:54321', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase
    .from('enrollments')
    .select('students!enrollments_student_id_fkey!inner(*)')
    .order('students(last_name)', { ascending: true })
    .limit(1);
  console.log(error || data);
}
run();
