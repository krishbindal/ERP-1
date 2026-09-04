export interface EntityField {
  key: string;
  label: string;
  required: boolean;
  description?: string;
  aliases?: string[];
}

export interface CsvParseResult {
  headers: string[];
  previewRows: string[][];
  totalRows: number;
  delimiter: string;
  error?: string;
}

export interface ValidationSummary {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errorCount: number;
  errors: Array<{ row: number; field: string; message: string }>;
}

export const STUDENT_ENTITY_FIELDS: EntityField[] = [
  {
    key: 'firstName',
    label: 'First Name',
    required: true,
    description: 'Given name of the student',
    aliases: ['first_name', 'firstname', 'first', 'fname', 'given_name', 'student_first_name'],
  },
  {
    key: 'lastName',
    label: 'Last Name',
    required: true,
    description: 'Family name or surname of the student',
    aliases: ['last_name', 'lastname', 'last', 'lname', 'surname', 'family_name', 'student_last_name'],
  },
  {
    key: 'middleName',
    label: 'Middle Name',
    required: false,
    description: 'Middle or secondary name',
    aliases: ['middle_name', 'middlename', 'middle', 'mname'],
  },
  {
    key: 'dateOfBirth',
    label: 'Date of Birth',
    required: false,
    description: 'Date of birth formatted as YYYY-MM-DD or DD/MM/YYYY',
    aliases: ['date_of_birth', 'dob', 'birth_date', 'birthdate', 'born'],
  },
  {
    key: 'gender',
    label: 'Gender',
    required: false,
    description: 'Student gender (e.g. Male, Female, Other)',
    aliases: ['gender', 'sex'],
  },
  {
    key: 'admissionNumber',
    label: 'Admission Number',
    required: false,
    description: 'Unique student registration or admission number',
    aliases: ['admission_number', 'admission_no', 'adm_no', 'student_id', 'roll_no', 'roll_number', 'id'],
  },
  {
    key: 'gradeClass',
    label: 'Grade / Class',
    required: false,
    description: 'Enrolling class or standard',
    aliases: ['class', 'grade', 'standard', 'class_name', 'enrolled_class'],
  },
  {
    key: 'guardianName',
    label: 'Guardian Name',
    required: false,
    description: 'Primary parent or guardian full name',
    aliases: ['guardian_name', 'parent_name', 'father_name', 'mother_name', 'guardian', 'parent'],
  },
  {
    key: 'guardianPhone',
    label: 'Guardian Contact',
    required: false,
    description: 'Phone number or email for parent notifications',
    aliases: ['guardian_phone', 'parent_phone', 'phone', 'contact', 'mobile', 'parent_contact'],
  },
];
