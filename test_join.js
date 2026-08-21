import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.B0C-G0f9W-G42q2B0Fj8e3Xl-9zC1YyN7T_4s_Gk8c4'
const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const { data, error } = await supabase
      .from('timetable_entries')
      .select('*, classes ( name ), sections ( name ), subjects ( name ), periods ( name, start_time, end_time ), rooms ( name ), staff_branch_profiles ( staff ( first_name, last_name ) )')
  
  console.log("Error:", error)
  console.log("Data:", JSON.stringify(data, null, 2))
}

main()
