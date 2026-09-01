-- Homework Grants missing from earlier migrations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework_attachments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework_submission_attachments TO authenticated;
GRANT SELECT ON public.homework_audit_logs TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework_assignments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework_attachments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework_submissions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework_submission_attachments TO service_role;
GRANT SELECT ON public.homework_audit_logs TO service_role;
