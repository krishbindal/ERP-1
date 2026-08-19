import re

with open('supabase/tests/db/10_teacher_subject_assignments.sql', 'r') as f:
    content = f.read()

# Fix the body of test_insert_tsa
bad_body_1 = "SELECT pg_temp.test_insert_tsa(NULL, p_branch_id, p_year_id, p_class_id, p_section_id, p_subject_id, p_staff_profile_id, COALESCE(p_is_primary, false), COALESCE(p_status, 'ACTIVE'))"
good_body_1 = """INSERT INTO public.teacher_subject_assignments (branch_id, academic_year_id, class_id, section_id, subject_id, staff_branch_profile_id, is_primary, status)
        VALUES (p_branch_id, p_year_id, p_class_id, p_section_id, p_subject_id, p_staff_profile_id, COALESCE(p_is_primary, false), COALESCE(p_status, 'ACTIVE'))"""

bad_body_2 = "SELECT pg_temp.test_insert_tsa(p_id, p_branch_id, p_year_id, p_class_id, p_section_id, p_subject_id, p_staff_profile_id, COALESCE(p_is_primary, false), COALESCE(p_status, 'ACTIVE'))"
good_body_2 = """INSERT INTO public.teacher_subject_assignments (id, branch_id, academic_year_id, class_id, section_id, subject_id, staff_branch_profile_id, is_primary, status)
        VALUES (p_id, p_branch_id, p_year_id, p_class_id, p_section_id, p_subject_id, p_staff_profile_id, COALESCE(p_is_primary, false), COALESCE(p_status, 'ACTIVE'))"""

content = content.replace(bad_body_1, good_body_1)
content = content.replace(bad_body_2, good_body_2)

with open('supabase/tests/db/10_teacher_subject_assignments.sql', 'w') as f:
    f.write(content)
