export interface AcademicYear {
  id: string;
  branch_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'archived' | 'planned';
}

export interface Class {
  id: string;
  branch_id: string;
  academic_year_id: string;
  name: string;
  level: number;
}

export interface Section {
  id: string;
  class_id: string;
  name: string;
  capacity: number;
}

export interface ClassWithYear extends Class {
  academic_years: Pick<AcademicYear, 'name'>;
}

export interface SectionWithClass extends Section {
  classes: Pick<Class, 'name'> & {
    academic_years: Pick<AcademicYear, 'name'>;
  };
}
