const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('http://127.0.0.1:54321', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU');
(async () => {
  const { data, error } = await supabase
    .from('homework_assignments')
    .select('*, sections!homework_assignments_section_id_fkey(name), subjects!homework_assignments_subject_id_fkey(name)');
  if (error) console.log('ERROR:', error);
  else console.log('SUCCESS:', data.length);
})();
