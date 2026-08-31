const fs = require('fs');
let seed = fs.readFileSync('supabase/seed.sql', 'utf8');

const s1 = `ON CONFLICT DO NOTHING;\n\n\n-- Assignments`;
const r1 = `ON CONFLICT DO NOTHING;\n\n-- Seed attendance session and record for guardian history test\nINSERT INTO public.attendance_sessions (id, branch_id, academic_year_id, section_id, date, locked_at, published_at)\nVALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'aaaaaaaa-1111-1111-1111-111111111111', 'aaaaaaaa-3333-3333-3333-333333333333', '2026-08-10', now(), now())\nON CONFLICT DO NOTHING;\n\nINSERT INTO public.attendance_records (session_id, student_id, status)\nVALUES ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee51', 'ABSENT')\nON CONFLICT DO NOTHING;\n\n\n-- Assignments`;
seed = seed.replace(s1, r1);

const s2 = `eeeeeeee-eeee-eeee-eeee-eeeeeeeeee32')\nON CONFLICT DO NOTHING;\n\n-- Add user_credentials`;
const r2 = `eeeeeeee-eeee-eeee-eeee-eeeeeeeeee32')\nON CONFLICT DO NOTHING;\n\n-- Organization Memberships for Guardian\nINSERT INTO public.organization_memberships (organization_id, user_id) VALUES\n('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea004')\nON CONFLICT DO NOTHING;\n\n-- Add user_credentials`;
seed = seed.replace(s2, r2);

fs.writeFileSync('supabase/seed.sql', seed);
console.log('Done!');
