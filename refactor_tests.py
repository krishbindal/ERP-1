import re

with open('supabase/tests/db/10_teacher_subject_assignments.sql', 'r') as f:
    content = f.read()

helper_fn = """-- ==========================================
-- 2. SCHEMA Verifications
-- ==========================================
CREATE OR REPLACE FUNCTION pg_temp.test_insert_tsa(
    p_id UUID, p_branch_id UUID, p_year_id UUID, p_class_id UUID, 
    p_section_id UUID, p_subject_id UUID, p_staff_profile_id UUID, 
    p_is_primary BOOLEAN DEFAULT false, p_status TEXT DEFAULT 'ACTIVE'
) RETURNS VOID AS $fn$
BEGIN
    IF p_id IS NULL THEN
        INSERT INTO public.teacher_subject_assignments (branch_id, academic_year_id, class_id, section_id, subject_id, staff_branch_profile_id, is_primary, status)
        VALUES (p_branch_id, p_year_id, p_class_id, p_section_id, p_subject_id, p_staff_profile_id, COALESCE(p_is_primary, false), COALESCE(p_status, 'ACTIVE'));
    ELSE
        INSERT INTO public.teacher_subject_assignments (id, branch_id, academic_year_id, class_id, section_id, subject_id, staff_branch_profile_id, is_primary, status)
        VALUES (p_id, p_branch_id, p_year_id, p_class_id, p_section_id, p_subject_id, p_staff_profile_id, COALESCE(p_is_primary, false), COALESCE(p_status, 'ACTIVE'));
    END IF;
END;
$fn$ LANGUAGE plpgsql;

-- 1. table exists"""

content = content.replace("-- ==========================================\n-- 2. SCHEMA Verifications\n-- ==========================================\n-- 1. table exists", helper_fn)

def replacer(match):
    s = match.group(0)
    columns_str = re.search(r'\((.*?)\)', s).group(1)
    columns = [c.strip() for c in columns_str.split(',')]
    
    values_str = re.search(r'VALUES\s*\((.*?)\)', s, re.DOTALL).group(1)
    values = [v.strip() for v in values_str.split(',')]
    
    arg_dict = dict(zip(columns, values))
    
    id_val = arg_dict.get('id', 'NULL')
    b_val = arg_dict.get('branch_id', 'NULL')
    y_val = arg_dict.get('academic_year_id', 'NULL')
    c_val = arg_dict.get('class_id', 'NULL')
    sec_val = arg_dict.get('section_id', 'NULL')
    sub_val = arg_dict.get('subject_id', 'NULL')
    sp_val = arg_dict.get('staff_branch_profile_id', 'NULL')
    prim_val = arg_dict.get('is_primary', 'false')
    stat_val = arg_dict.get('status', "'ACTIVE'")
    
    return f"SELECT pg_temp.test_insert_tsa({id_val}, {b_val}, {y_val}, {c_val}, {sec_val}, {sub_val}, {sp_val}, {prim_val}, {stat_val})"

content = re.sub(r'INSERT INTO public\.teacher_subject_assignments\s*\([^)]+\)\s*VALUES\s*\([^)]+\)', replacer, content)

with open('supabase/tests/db/10_teacher_subject_assignments.sql', 'w') as f:
    f.write(content)
