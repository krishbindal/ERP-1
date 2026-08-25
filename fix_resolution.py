import os

with open('supabase/migrations/20260827000035_phase_5_communication_rpc_fix.sql', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# We want to replace the `fn_resolve_message_recipients` body with the robust logic
new_func = """CREATE OR REPLACE FUNCTION public.fn_resolve_message_recipients(p_message_id UUID)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_msg RECORD;
    v_recipients UUID[];
BEGIN
    SELECT * INTO v_msg FROM public.communication_messages WHERE id = p_message_id;
    IF NOT FOUND THEN RETURN ARRAY[]::UUID[]; END IF;

    SELECT array_agg(DISTINCT p_id) INTO v_recipients
    FROM (
        SELECT DISTINCT s.profile_id AS p_id
        FROM public.communication_message_targets cmt
        JOIN public.enrollments e ON (
            e.branch_id = v_msg.branch_id AND
            (
                (cmt.target_type = 'BRANCH' AND e.branch_id = v_msg.branch_id) OR
                (cmt.target_type = 'CLASS' AND e.class_id = cmt.target_id) OR
                (cmt.target_type = 'SECTION' AND e.section_id = cmt.target_id)
            )
        )
        JOIN public.academic_years ay ON e.academic_year_id = ay.id
        JOIN public.students s ON e.student_id = s.id
        WHERE cmt.message_id = p_message_id
          AND e.status = 'ACTIVE'
          AND ay.status = 'ACTIVE'
          AND s.profile_id IS NOT NULL

        UNION
        
        SELECT DISTINCT g.profile_id AS p_id
        FROM public.communication_message_targets cmt
        JOIN public.enrollments e ON (
            e.branch_id = v_msg.branch_id AND
            (
                (cmt.target_type = 'BRANCH' AND e.branch_id = v_msg.branch_id) OR
                (cmt.target_type = 'CLASS' AND e.class_id = cmt.target_id) OR
                (cmt.target_type = 'SECTION' AND e.section_id = cmt.target_id)
            )
        )
        JOIN public.academic_years ay ON e.academic_year_id = ay.id
        JOIN public.student_guardians sg ON e.student_id = sg.student_id
        JOIN public.guardians g ON sg.guardian_id = g.id
        WHERE cmt.message_id = p_message_id
          AND e.status = 'ACTIVE'
          AND ay.status = 'ACTIVE'
          AND g.profile_id IS NOT NULL
          AND g.status = 'ACTIVE'
    ) sub;

    RETURN COALESCE(v_recipients, ARRAY[]::UUID[]);
END;
$$;"""

text = re.sub(r'CREATE OR REPLACE FUNCTION public\.fn_resolve_message_recipients.*?END;\n\$\$;', new_func, text, flags=re.DOTALL)

with open('supabase/migrations/20260827000035_phase_5_communication_rpc_fix.sql', 'w', encoding='utf-8') as f:
    f.write(text)

print("done")
