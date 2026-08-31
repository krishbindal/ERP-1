const fs = require('fs');
let content = fs.readFileSync('supabase/seed.sql', 'utf8');
const idx = content.indexOf('-- Seed attendance session for Guardian test');
if (idx !== -1) {
    content = content.substring(0, idx);
}
content += `
-- Seed attendance session for Guardian test
INSERT INTO public.attendance_sessions (id, branch_id, section_id, academic_year_id, date, locked_at, published_at, published_by)
VALUES ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02', 'aaaaaaaa-3333-3333-3333-333333333333', 'aaaaaaaa-1111-1111-1111-111111111111', '2026-08-10', now(), now(), 'eeeeeeee-eeee-eeee-eeee-eeeeeeeea002')
ON CONFLICT DO NOTHING;

INSERT INTO public.attendance_records (session_id, student_id, status, notes)
VALUES ('00000000-0000-0000-0000-000000000000', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee51', 'ABSENT', 'Sick')
ON CONFLICT DO NOTHING;
`;
fs.writeFileSync('supabase/seed.sql', content);
