-- Phase 3C.3B: Class Teachers

-- 1. Add structural unique constraint to staff_branch_profiles for composite FK
ALTER TABLE public.staff_branch_profiles
    ADD CONSTRAINT staff_branch_profiles_id_branch_id_key UNIQUE (id, branch_id);

-- 2. Add class_teacher_id to sections
ALTER TABLE public.sections
    ADD COLUMN class_teacher_id UUID;

-- 3. Add composite foreign key for structural tenant isolation
ALTER TABLE public.sections
    ADD CONSTRAINT fk_sections_class_teacher FOREIGN KEY (class_teacher_id, branch_id) REFERENCES public.staff_branch_profiles(id, branch_id) ON DELETE RESTRICT;

-- 4. Add index for reverse lookups
CREATE INDEX idx_sections_class_teacher ON public.sections(class_teacher_id);

-- 5. Add audit trigger for sections
CREATE TRIGGER audit_sections AFTER INSERT OR UPDATE OR DELETE ON public.sections FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
