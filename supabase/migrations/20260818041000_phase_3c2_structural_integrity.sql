-- Phase 3C.2: Academic Structural Integrity

-- ==========================================
-- 1. CASCADE TO RESTRICT CONVERSION
-- ==========================================

-- 1.1 academic_years
ALTER TABLE public.academic_years DROP CONSTRAINT IF EXISTS fk_academic_years_branch;
ALTER TABLE public.academic_years
    ADD CONSTRAINT fk_academic_years_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE RESTRICT;

-- 1.2 classes
ALTER TABLE public.classes DROP CONSTRAINT IF EXISTS fk_classes_academic_year;
ALTER TABLE public.classes
    ADD CONSTRAINT fk_classes_academic_year FOREIGN KEY (academic_year_id, branch_id) REFERENCES public.academic_years(id, branch_id) ON DELETE RESTRICT;

-- 1.3 subjects
ALTER TABLE public.subjects DROP CONSTRAINT IF EXISTS fk_subjects_branch;
ALTER TABLE public.subjects
    ADD CONSTRAINT fk_subjects_branch FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE RESTRICT;

-- 1.4 class_subjects
ALTER TABLE public.class_subjects DROP CONSTRAINT IF EXISTS fk_class_subjects_class;
ALTER TABLE public.class_subjects DROP CONSTRAINT IF EXISTS fk_class_subjects_subject;
ALTER TABLE public.class_subjects
    ADD CONSTRAINT fk_class_subjects_class FOREIGN KEY (class_id, branch_id) REFERENCES public.classes(id, branch_id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_class_subjects_subject FOREIGN KEY (subject_id, branch_id) REFERENCES public.subjects(id, branch_id) ON DELETE RESTRICT;

-- ==========================================
-- 2. STRUCTURAL IDENTITY (CLASSES)
-- ==========================================
ALTER TABLE public.classes
    ADD CONSTRAINT classes_id_academic_year_id_branch_id_key UNIQUE (id, academic_year_id, branch_id);

-- ==========================================
-- 3. STRUCTURAL IDENTITY (SECTIONS)
-- ==========================================

-- 3.1 Add academic_year_id
ALTER TABLE public.sections
    ADD COLUMN academic_year_id UUID;

-- 3.2 Deterministic Backfill
UPDATE public.sections s
SET academic_year_id = c.academic_year_id
FROM public.classes c
WHERE s.class_id = c.id;

-- 3.3 Make NOT NULL
ALTER TABLE public.sections
    ALTER COLUMN academic_year_id SET NOT NULL;

-- 3.4 Replace FK with composite and RESTRICT
ALTER TABLE public.sections DROP CONSTRAINT IF EXISTS fk_sections_class;
ALTER TABLE public.sections
    ADD CONSTRAINT fk_sections_class FOREIGN KEY (class_id, academic_year_id, branch_id) REFERENCES public.classes(id, academic_year_id, branch_id) ON DELETE RESTRICT;

-- 3.5 Unique constraint for future children
ALTER TABLE public.sections
    ADD CONSTRAINT sections_id_class_id_academic_year_id_branch_id_key UNIQUE (id, class_id, academic_year_id, branch_id);

-- ==========================================
-- 4. INDEXES
-- ==========================================

-- Sections by academic year (useful for RLS and querying all sections in a year across classes)
CREATE INDEX idx_sections_academic_year ON public.sections(academic_year_id);
