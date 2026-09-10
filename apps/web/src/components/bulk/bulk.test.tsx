import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('lucide-react', () => {
  const createMockIcon = (name: string) => {
    const MockIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
      <svg ref={ref} data-testid={`icon-${name}`} {...props} />
    ));
    MockIcon.displayName = name;
    return MockIcon;
  };
  return {
    Upload: createMockIcon('upload'),
    FileText: createMockIcon('file-text'),
    FileSpreadsheet: createMockIcon('file-spreadsheet'),
    CheckCircle: createMockIcon('check-circle'),
    CheckCircle2: createMockIcon('check-circle-2'),
    AlertCircle: createMockIcon('alert-circle'),
    AlertTriangle: createMockIcon('alert-triangle'),
    X: createMockIcon('x'),
    RotateCcw: createMockIcon('rotate-ccw'),
    Info: createMockIcon('info'),
    ChevronDown: createMockIcon('chevron-down'),
    Wand2: createMockIcon('wand2'),
    ArrowLeft: createMockIcon('arrow-left'),
    ArrowRight: createMockIcon('arrow-right'),
    Download: createMockIcon('download'),
    Check: createMockIcon('check'),
    Sparkles: createMockIcon('sparkles'),
    Loader2: createMockIcon('loader2'),
  };
});

import {
  parseCsv,
  detectDelimiter,
  generateStudentCsvTemplate,
  BulkUploadDropzone,
  validateFile,
  formatFileSize,
  CsvPreviewTable,
  ColumnMapper,
  autoMatchColumns,
  normalizeName,
  StudentBulkWizard,
  STUDENT_ENTITY_FIELDS,
} from './index';

describe('Bulk & Onboarding UX Suite', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  describe('RFC 4180 CSV / TSV Parser', () => {
    it('detects comma, tab, and semicolon delimiters accurately', () => {
      expect(detectDelimiter('a,b,c\n1,2,3')).toBe(',');
      expect(detectDelimiter('a\tb\tc\n1\t2\t3')).toBe('\t');
      expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
    });

    it('parses standard comma-delimited records', () => {
      const csv = 'First Name,Last Name,Grade\nAlice,Smith,Grade 5\nBob,Jones,Grade 6';
      const result = parseCsv(csv);

      expect(result.headers).toEqual(['First Name', 'Last Name', 'Grade']);
      expect(result.totalRows).toBe(2);
      expect(result.previewRows[0]).toEqual(['Alice', 'Smith', 'Grade 5']);
      expect(result.previewRows[1]).toEqual(['Bob', 'Jones', 'Grade 6']);
    });

    it('handles quoted values with embedded commas and escaped quotes', () => {
      const csv = 'Name,Bio\n"Doe, John","He said ""Hello, world!"" and left."';
      const result = parseCsv(csv);

      expect(result.headers).toEqual(['Name', 'Bio']);
      expect(result.previewRows[0][0]).toBe('Doe, John');
      expect(result.previewRows[0][1]).toBe('He said "Hello, world!" and left.');
    });

    it('handles newlines inside quoted fields', () => {
      const csv = 'ID,Comment\n101,"Line 1\nLine 2\nLine 3"';
      const result = parseCsv(csv);

      expect(result.headers).toEqual(['ID', 'Comment']);
      expect(result.totalRows).toBe(1);
      expect(result.previewRows[0][1]).toContain('Line 1\nLine 2\nLine 3');
    });

    it('handles UTF-8 BOM if present', () => {
      const csvWithBom = '\uFEFFHeaderA,HeaderB\nValA,ValB';
      const result = parseCsv(csvWithBom);

      expect(result.headers).toEqual(['HeaderA', 'HeaderB']);
      expect(result.previewRows[0]).toEqual(['ValA', 'ValB']);
    });

    it('returns structured error for empty text', () => {
      const result = parseCsv('   \n  ');
      expect(result.error).toBeDefined();
      expect(result.headers).toEqual([]);
      expect(result.totalRows).toBe(0);
    });

    it('generates a valid student CSV template with expected headers', () => {
      const template = generateStudentCsvTemplate();
      expect(template).toContain('First Name,Last Name,Middle Name');
      const parsed = parseCsv(template);
      expect(parsed.headers).toContain('First Name');
      expect(parsed.headers).toContain('Last Name');
      expect(parsed.totalRows).toBeGreaterThan(0);
    });
  });

  describe('BulkUploadDropzone Component', () => {
    it('validates file extensions and size correctly', () => {
      const validCsv = new File(['content'], 'students.csv', { type: 'text/csv' });
      const validTsv = new File(['content'], 'students.tsv', { type: 'text/tab-separated-values' });
      const invalidExe = new File(['content'], 'danger.exe', { type: 'application/octet-stream' });
      const largeFile = new File([new ArrayBuffer(15 * 1024 * 1024)], 'big.csv', { type: 'text/csv' });

      expect(validateFile(validCsv, ['.csv', '.tsv'], 10 * 1024 * 1024).valid).toBe(true);
      expect(validateFile(validTsv, ['.csv', '.tsv'], 10 * 1024 * 1024).valid).toBe(true);
      expect(validateFile(invalidExe, ['.csv', '.tsv'], 10 * 1024 * 1024).valid).toBe(false);
      expect(validateFile(largeFile, ['.csv', '.tsv'], 10 * 1024 * 1024).valid).toBe(false);
    });

    it('formats file sizes cleanly', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(2048)).toBe('2.0 KB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
    });

    it('renders idle dropzone with accessible button and instructions', async () => {
      await act(async () => {
        root.render(
          <BulkUploadDropzone
            onFileSelect={vi.fn()}
            acceptedExtensions={['.csv', '.tsv', '.xlsx']}
          />
        );
      });

      const dropzone = container.querySelector('[role="region"][aria-label="File upload dropzone"]');
      expect(dropzone).not.toBeNull();
      expect(container.textContent).toContain('Browse Files');
      expect(container.textContent).toContain('.csv, .tsv, .xlsx');
    });

    it('renders loaded state when currentFile is passed with clear button', async () => {
      const testFile = new File(['Col1\nVal1'], 'test_roster.csv', { type: 'text/csv' });
      const handleClear = vi.fn();

      await act(async () => {
        root.render(
          <BulkUploadDropzone
            currentFile={testFile}
            onFileSelect={vi.fn()}
            onFileClear={handleClear}
          />
        );
      });

      expect(container.textContent).toContain('test_roster.csv');
      expect(container.textContent).toContain('Ready');
      expect(container.textContent).toContain('Replace');

      const clearBtn = container.querySelector('button[aria-label="Remove selected file"]');
      expect(clearBtn).not.toBeNull();
      await act(async () => {
        clearBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('CsvPreviewTable Component', () => {
    it('renders placeholder when headers are empty', async () => {
      await act(async () => {
        root.render(<CsvPreviewTable headers={[]} rows={[]} totalRows={0} />);
      });

      expect(container.textContent).toContain('No spreadsheet data loaded');
    });

    it('renders table with columns, rows, and indices', async () => {
      const headers = ['First Name', 'Last Name', 'Class'];
      const rows = [
        ['Alice', 'Smith', 'Grade 5'],
        ['Bob', 'Jones', 'Grade 6'],
      ];

      await act(async () => {
        root.render(
          <CsvPreviewTable
            headers={headers}
            rows={rows}
            totalRows={2}
            delimiter=","
          />
        );
      });

      expect(container.textContent).toContain('3 Columns');
      expect(container.textContent).toContain('2 Rows detected');
      expect(container.textContent).toContain('Alice');
      expect(container.textContent).toContain('Smith');
      expect(container.textContent).toContain('Grade 5');
    });

    it('renders mapped field indicators when mapping is provided', async () => {
      const headers = ['first_name', 'last_name'];
      const rows = [['Alice', 'Smith']];
      const mapping = { firstName: 'first_name', lastName: 'last_name' };

      await act(async () => {
        root.render(
          <CsvPreviewTable
            headers={headers}
            rows={rows}
            totalRows={1}
            columnMapping={mapping}
            entityFields={STUDENT_ENTITY_FIELDS}
          />
        );
      });

      expect(container.textContent).toContain('➔ First Name');
      expect(container.textContent).toContain('➔ Last Name');
    });
  });

  describe('ColumnMapper Component & Auto-Match Heuristic', () => {
    it('normalizes names properly', () => {
      expect(normalizeName('First Name')).toBe('firstname');
      expect(normalizeName('first_name')).toBe('firstname');
      expect(normalizeName('DATE-OF-BIRTH')).toBe('dateofbirth');
    });

    it('auto-matches headers with exact, alias, and substring heuristics', () => {
      const headers = [
        'fname',
        'Last Name',
        'dob',
        'gender',
        'adm_no',
        'class_name',
        'parent_name',
        'phone',
      ];

      const matched = autoMatchColumns(headers, STUDENT_ENTITY_FIELDS);

      expect(matched['firstName']).toBe('fname');
      expect(matched['lastName']).toBe('Last Name');
      expect(matched['dateOfBirth']).toBe('dob');
      expect(matched['gender']).toBe('gender');
      expect(matched['admissionNumber']).toBe('adm_no');
      expect(matched['gradeClass']).toBe('class_name');
      expect(matched['guardianName']).toBe('parent_name');
      expect(matched['guardianPhone']).toBe('phone');
    });

    it('renders required field badges and triggers onChange on selection change', async () => {
      const headers = ['First Name', 'Last Name', 'Other'];
      const handleChange = vi.fn();

      await act(async () => {
        root.render(
          <ColumnMapper
            csvHeaders={headers}
            entityFields={STUDENT_ENTITY_FIELDS}
            mapping={{ firstName: 'First Name' }}
            onChange={handleChange}
          />
        );
      });

      // Shows missing required warning because lastName is not yet mapped
      expect(container.textContent).toContain('Required Fields Unmapped');
      expect(container.textContent).toContain('Last Name');

      // Select dropdown for Last Name
      const lastNameSelect = container.querySelector('#mapping-lastName') as HTMLSelectElement;
      expect(lastNameSelect).not.toBeNull();

      await act(async () => {
        lastNameSelect.value = 'Last Name';
        lastNameSelect.dispatchEvent(new Event('change', { bubbles: true }));
      });

      expect(handleChange).toHaveBeenCalledWith({
        firstName: 'First Name',
        lastName: 'Last Name',
      });
    });
  });

  describe('StudentBulkWizard Component', () => {
    it('renders Step 1 with template download action and disabled Continue button', async () => {
      await act(async () => {
        root.render(<StudentBulkWizard branchId="branch-uuid-101" />);
      });

      expect(container.textContent).toContain('Step 1: Upload Student Records');
      expect(container.textContent).toContain('Download Template (.csv)');

      // Continue button should be disabled until a file is selected
      const continueBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Continue to Column Mapping')
      );
      expect(continueBtn?.disabled).toBe(true);
    });

    it('navigates through steps and validates missing required data', async () => {
      await act(async () => {
        root.render(<StudentBulkWizard branchId="branch-uuid-101" />);
      });

      // Simulate file upload via input change
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).not.toBeNull();

      const csvContent = 'First Name,Last Name,Admission Number\nJohn,Doe,ADM001\nJane,,ADM002';
      const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

      // Mock FileReader to execute synchronously in jsdom
      const originalFileReader = globalThis.FileReader;
      class MockFileReader {
        onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
        readAsText() {
          setTimeout(() => {
            if (this.onload) {
              this.onload({
                target: { result: csvContent },
              } as unknown as ProgressEvent<FileReader>);
            }
          }, 0);
        }
      }
      globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

      await act(async () => {
        Object.defineProperty(fileInput, 'files', {
          value: [file],
          configurable: true,
        });
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 20));
      });

      // Restore FileReader
      globalThis.FileReader = originalFileReader;

      // File is loaded, continue button should now be enabled
      const continueBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Continue to Column Mapping')
      );
      expect(continueBtn?.disabled).toBe(false);

      // Advance to Step 2
      await act(async () => {
        continueBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container.textContent).toContain('Step 2: Map Columns to Student Attributes');

      // Check that First Name and Last Name were auto-mapped
      const previewBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Preview & Validate Data')
      );
      expect(previewBtn?.disabled).toBe(false);

      // Advance to Step 3
      await act(async () => {
        previewBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container.textContent).toContain('Step 3: Preview and Pre-Flight Validation');
      // Second row has missing last name ("Jane,,ADM002") -> warning banner
      expect(container.textContent).toContain('Sample Validation Warnings');
      expect(container.textContent).toContain('Row 2: Last Name — Missing required value');

      // Advance to Step 4
      const confirmBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Proceed to Confirmation')
      );
      await act(async () => {
        confirmBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container.textContent).toContain('Step 4: Confirm and Queue Bulk Import');
      expect(container.textContent).toContain('branch-uuid-101');
      expect(container.textContent).toContain('Queue Student Ingestion');

      // Submit the import
      const queueBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Queue Student Ingestion')
      );
      expect(queueBtn).toBeDefined();

      await act(async () => {
        queueBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 900));
      });

      // Verification of completion screen
      expect(container.textContent).toContain('Bulk Ingestion Queued Successfully');
      expect(container.textContent).toContain('BATCH-');
      expect(container.textContent).toContain('Return to Students Roster');
      expect(container.textContent).toContain('Import Another Batch');

      // Reset and import another batch
      const resetBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Import Another Batch')
      );
      await act(async () => {
        resetBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container.textContent).toContain('Step 1: Upload Student Records');
    });

    it('triggers template download when Download Template button is clicked', async () => {
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      await act(async () => {
        root.render(<StudentBulkWizard branchId="branch-uuid-101" />);
      });

      const downloadBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Download Template (.csv)')
      );
      expect(downloadBtn).toBeDefined();

      await act(async () => {
        downloadBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });
  });

  describe('Dropzone Drag-and-Drop and Keyboard Interactions', () => {
    it('handles dragover, dragleave, and drop events', async () => {
      const handleSelect = vi.fn();
      await act(async () => {
        root.render(<BulkUploadDropzone onFileSelect={handleSelect} />);
      });

      const dropzone = container.querySelector('[role="region"][aria-label="File upload dropzone"]') as HTMLDivElement;
      expect(dropzone).not.toBeNull();

      // Drag over
      await act(async () => {
        dropzone.dispatchEvent(new Event('dragover', { bubbles: true }));
      });

      // Drag leave
      await act(async () => {
        dropzone.dispatchEvent(new Event('dragleave', { bubbles: true }));
      });

      // Drop file
      const droppedFile = new File(['Col1\nVal1'], 'dropped.csv', { type: 'text/csv' });
      await act(async () => {
        const dropEvent = new Event('drop', { bubbles: true }) as unknown as DragEvent;
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: { files: [droppedFile] },
        });
        dropzone.dispatchEvent(dropEvent as unknown as Event);
      });

      expect(handleSelect).toHaveBeenCalledWith(droppedFile);
    });

    it('handles keyboard enter/space to trigger file dialog', async () => {
      const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});

      await act(async () => {
        root.render(<BulkUploadDropzone onFileSelect={vi.fn()} />);
      });

      const dropzone = container.querySelector('[role="region"][aria-label="File upload dropzone"]') as HTMLDivElement;
      expect(dropzone).not.toBeNull();

      await act(async () => {
        dropzone.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });

      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });

    it('displays error alert when invalid file is dropped and allows dismissal', async () => {
      const handleError = vi.fn();
      await act(async () => {
        root.render(<BulkUploadDropzone onFileSelect={vi.fn()} onError={handleError} />);
      });

      const dropzone = container.querySelector('[role="region"][aria-label="File upload dropzone"]') as HTMLDivElement;
      const invalidFile = new File(['binary'], 'script.exe', { type: 'application/octet-stream' });

      await act(async () => {
        const dropEvent = new Event('drop', { bubbles: true }) as unknown as DragEvent;
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: { files: [invalidFile] },
        });
        dropzone.dispatchEvent(dropEvent as unknown as Event);
      });

      expect(handleError).toHaveBeenCalled();
      expect(container.textContent).toContain('Invalid file type');

      // Dismiss error
      const dismissBtn = container.querySelector('button[aria-label="Dismiss error"]');
      expect(dismissBtn).not.toBeNull();

      await act(async () => {
        dismissBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container.textContent).not.toContain('Invalid file type');
    });
  });

  describe('ColumnMapper Toolbar Actions', () => {
    it('triggers auto-match and clear-all actions', async () => {
      const handleChange = vi.fn();
      const headers = ['fname', 'lname', 'dob'];

      await act(async () => {
        root.render(
          <ColumnMapper
            csvHeaders={headers}
            entityFields={STUDENT_ENTITY_FIELDS}
            mapping={{ firstName: 'fname' }}
            onChange={handleChange}
          />
        );
      });

      // Click Auto-Match
      const autoMatchBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Auto-Match')
      );
      await act(async () => {
        autoMatchBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(handleChange).toHaveBeenCalled();

      // Click Reset
      const resetBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Reset')
      );
      await act(async () => {
        resetBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(handleChange).toHaveBeenCalledWith({});
    });
  });
});

