BEGIN;

ALTER TABLE public.attendance_sessions ADD CONSTRAINT attendance_sessions_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.branch_app_configs ADD CONSTRAINT branch_app_configs_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.branch_memberships ADD CONSTRAINT branch_memberships_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.calendar_events ADD CONSTRAINT calendar_events_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.class_subjects ADD CONSTRAINT class_subjects_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.communication_messages ADD CONSTRAINT communication_messages_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.communication_templates ADD CONSTRAINT communication_templates_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.homework_assignments ADD CONSTRAINT homework_assignments_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.sections ADD CONSTRAINT sections_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.student_branch_profiles ADD CONSTRAINT student_branch_profiles_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.teacher_subject_assignments ADD CONSTRAINT teacher_subject_assignments_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.timetable_entries ADD CONSTRAINT timetable_entries_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.timetable_substitutions ADD CONSTRAINT timetable_substitutions_id_branch_id_key UNIQUE (id, branch_id);
ALTER TABLE public.user_credentials ADD CONSTRAINT user_credentials_id_branch_id_key UNIQUE (id, branch_id);

ALTER TABLE public.attendance_sessions ADD CONSTRAINT attendance_sessions_id_academic_year_id_branch_id_key UNIQUE (id, academic_year_id, branch_id);
ALTER TABLE public.calendar_events ADD CONSTRAINT calendar_events_id_academic_year_id_branch_id_key UNIQUE (id, academic_year_id, branch_id);
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_id_academic_year_id_branch_id_key UNIQUE (id, academic_year_id, branch_id);
ALTER TABLE public.homework_assignments ADD CONSTRAINT homework_assignments_id_academic_year_id_branch_id_key UNIQUE (id, academic_year_id, branch_id);
ALTER TABLE public.sections ADD CONSTRAINT sections_id_academic_year_id_branch_id_key UNIQUE (id, academic_year_id, branch_id);
ALTER TABLE public.teacher_subject_assignments ADD CONSTRAINT teacher_subject_assignments_id_academic_year_id_branch_id_key UNIQUE (id, academic_year_id, branch_id);
ALTER TABLE public.timetable_entries ADD CONSTRAINT timetable_entries_id_academic_year_id_branch_id_key UNIQUE (id, academic_year_id, branch_id);
ALTER TABLE public.timetable_substitutions ADD CONSTRAINT timetable_substitutions_id_academic_year_id_branch_id_key UNIQUE (id, academic_year_id, branch_id);

CREATE TRIGGER prevent_attendance_sessions_branch_id_update
  BEFORE UPDATE ON public.attendance_sessions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_bell_schedules_branch_id_update
  BEFORE UPDATE ON public.bell_schedules
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_branch_app_configs_branch_id_update
  BEFORE UPDATE ON public.branch_app_configs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_branch_memberships_branch_id_update
  BEFORE UPDATE ON public.branch_memberships
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_communication_messages_branch_id_update
  BEFORE UPDATE ON public.communication_messages
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_communication_templates_branch_id_update
  BEFORE UPDATE ON public.communication_templates
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_enrollments_branch_id_update
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_homework_assignments_branch_id_update
  BEFORE UPDATE ON public.homework_assignments
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_periods_branch_id_update
  BEFORE UPDATE ON public.periods
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_rooms_branch_id_update
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_staff_branch_profiles_branch_id_update
  BEFORE UPDATE ON public.staff_branch_profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_student_branch_profiles_branch_id_update
  BEFORE UPDATE ON public.student_branch_profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_teacher_subject_assignments_branch_id_update
  BEFORE UPDATE ON public.teacher_subject_assignments
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_timetable_entries_branch_id_update
  BEFORE UPDATE ON public.timetable_entries
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_timetable_substitutions_branch_id_update
  BEFORE UPDATE ON public.timetable_substitutions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

CREATE TRIGGER prevent_user_credentials_branch_id_update
  BEFORE UPDATE ON public.user_credentials
  FOR EACH ROW EXECUTE FUNCTION public.prevent_branch_id_update();

-- Upgrading FK on attendance_sessions to target academic_years
ALTER TABLE public.attendance_sessions DROP CONSTRAINT attendance_sessions_academic_year_id_fkey;
ALTER TABLE public.attendance_sessions ADD CONSTRAINT attendance_sessions_academic_year_id_fkey FOREIGN KEY (academic_year_id, branch_id) REFERENCES public.academic_years(id, branch_id) ON DELETE RESTRICT;

-- Upgrading FK on attendance_sessions to target sections
ALTER TABLE public.attendance_sessions DROP CONSTRAINT attendance_sessions_section_id_fkey;
ALTER TABLE public.attendance_sessions ADD CONSTRAINT attendance_sessions_section_id_fkey FOREIGN KEY (section_id, branch_id) REFERENCES public.sections(id, branch_id) ON DELETE RESTRICT;

-- Upgrading FK on enrollments to target student_branch_profiles
ALTER TABLE public.enrollments DROP CONSTRAINT enrollments_student_branch_profile_id_fkey;
ALTER TABLE public.enrollments ADD CONSTRAINT enrollments_student_branch_profile_id_fkey FOREIGN KEY (student_branch_profile_id, branch_id) REFERENCES public.student_branch_profiles(id, branch_id) ON DELETE RESTRICT;

-- Upgrading FK on homework_assignments to target academic_years
ALTER TABLE public.homework_assignments DROP CONSTRAINT homework_assignments_academic_year_id_fkey;
ALTER TABLE public.homework_assignments ADD CONSTRAINT homework_assignments_academic_year_id_fkey FOREIGN KEY (academic_year_id, branch_id) REFERENCES public.academic_years(id, branch_id) ON DELETE RESTRICT;

-- Upgrading FK on homework_assignments to target staff_branch_profiles
ALTER TABLE public.homework_assignments DROP CONSTRAINT homework_assignments_author_profile_id_fkey;
ALTER TABLE public.homework_assignments ADD CONSTRAINT homework_assignments_author_profile_id_fkey FOREIGN KEY (author_profile_id, branch_id) REFERENCES public.staff_branch_profiles(id, branch_id) ON DELETE RESTRICT;

-- Upgrading FK on homework_assignments to target classes
ALTER TABLE public.homework_assignments DROP CONSTRAINT homework_assignments_class_id_fkey;
ALTER TABLE public.homework_assignments ADD CONSTRAINT homework_assignments_class_id_fkey FOREIGN KEY (class_id, branch_id) REFERENCES public.classes(id, branch_id) ON DELETE RESTRICT;

-- Upgrading FK on homework_assignments to target sections
ALTER TABLE public.homework_assignments DROP CONSTRAINT homework_assignments_section_id_fkey;
ALTER TABLE public.homework_assignments ADD CONSTRAINT homework_assignments_section_id_fkey FOREIGN KEY (section_id, branch_id) REFERENCES public.sections(id, branch_id) ON DELETE RESTRICT;

-- Upgrading FK on homework_assignments to target subjects
ALTER TABLE public.homework_assignments DROP CONSTRAINT homework_assignments_subject_id_fkey;
ALTER TABLE public.homework_assignments ADD CONSTRAINT homework_assignments_subject_id_fkey FOREIGN KEY (subject_id, branch_id) REFERENCES public.subjects(id, branch_id) ON DELETE RESTRICT;

COMMIT;