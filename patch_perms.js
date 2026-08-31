const fs = require('fs');
let seed = fs.readFileSync('supabase/seed.sql', 'utf8');

const s3 = `INSERT INTO public.roles (id, organization_id, name) VALUES\n('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee32', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Guardian') ON CONFLICT DO NOTHING;`;
const r3 = `INSERT INTO public.roles (id, organization_id, name) VALUES\n('eeeeeeee-eeee-eeee-eeee-eeeeeeeeee32', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01', 'Guardian') ON CONFLICT DO NOTHING;\n\n-- Fix missing role permissions for attendance\nINSERT INTO public.role_permissions (role_id, permission_id)\nSELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee31', id FROM public.permissions WHERE name IN ('attendance.session.read', 'attendance.session.manage')\nON CONFLICT DO NOTHING;\n\nINSERT INTO public.role_permissions (role_id, permission_id)\nSELECT 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee30', id FROM public.permissions WHERE name IN ('attendance.session.read', 'attendance.session.manage', 'attendance.session.publish', 'attendance.session.correct')\nON CONFLICT DO NOTHING;`;

seed = seed.replace(s3, r3);
fs.writeFileSync('supabase/seed.sql', seed);
console.log('patched perms');
