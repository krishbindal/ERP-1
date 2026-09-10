import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
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
    Search: createMockIcon('search'),
    ArrowUpDown: createMockIcon('arrow-up-down'),
    ArrowUp: createMockIcon('arrow-up'),
    ArrowDown: createMockIcon('arrow-down'),
    Plus: createMockIcon('plus'),
    RotateCcw: createMockIcon('rotate-ccw'),
    AlertTriangle: createMockIcon('alert-triangle'),
    Loader2: createMockIcon('loader2'),
    ChevronDown: createMockIcon('chevron-down'),
    CheckCircle: createMockIcon('check-circle'),
    AlertCircle: createMockIcon('alert-circle'),
    Info: createMockIcon('info'),
    X: createMockIcon('x'),
  };
});

const mockCreateAcademicYear = vi.fn().mockResolvedValue({ success: true });
const mockUpdateAcademicYear = vi.fn().mockResolvedValue({ success: true });
const mockDeleteAcademicYear = vi.fn().mockResolvedValue({ success: true });

vi.mock('../actions', () => ({
  createAcademicYear: (...args: unknown[]) => mockCreateAcademicYear(...args),
  updateAcademicYear: (...args: unknown[]) => mockUpdateAcademicYear(...args),
  deleteAcademicYear: (...args: unknown[]) => mockDeleteAcademicYear(...args),
}));

import { AcademicYearsTable } from './AcademicYearsTable';
import { AcademicYearForm } from './AcademicYearForm';
import { AcademicYear } from './types';

describe('AcademicYearsTable component', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = '';
  });

  it('renders table with accessible headers, search filter, and delete ConfirmDialog', async () => {
    const mockYears: AcademicYear[] = [
      {
        id: 'ay-1',
        branch_id: 'b-1',
        name: 'AY 2026-2027',
        start_date: '2026-06-01',
        end_date: '2027-03-31',
        status: 'active',
      },
      {
        id: 'ay-2',
        branch_id: 'b-1',
        name: 'AY 2025-2026',
        start_date: '2025-06-01',
        end_date: '2026-03-31',
        status: 'archived',
      },
    ];

    await act(async () => {
      root.render(<AcademicYearsTable data={mockYears} isReadOnly={false} />);
    });

    // Verify accessible headers with scope="col"
    const ths = container.querySelectorAll('th');
    expect(ths.length).toBeGreaterThanOrEqual(4);
    ths.forEach((th) => {
      expect(th.getAttribute('scope')).toBe('col');
    });

    // Check rows rendered
    expect(container.textContent).toContain('AY 2026-2027');
    expect(container.textContent).toContain('AY 2025-2026');

    // Test search filter
    const searchInput = container.querySelector('#academic-year-search') as HTMLInputElement;
    expect(searchInput).not.toBeNull();

    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(searchInput, '2026-2027');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('AY 2026-2027');
    expect(container.textContent).not.toContain('AY 2025-2026');

    // Trigger Delete ConfirmDialog
    const deleteBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Delete')
    );
    expect(deleteBtn).toBeDefined();

    await act(async () => {
      deleteBtn?.click();
    });

    // Confirm dialog should be open with accessible dialog role and message
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('Delete Academic Year');
    expect(dialog?.textContent).toContain('Are you sure you want to delete academic year "AY 2026-2027"?');
  });

  it('renders empty state card when 0 academic years exist', async () => {
    await act(async () => {
      root.render(<AcademicYearsTable data={[]} isReadOnly={false} />);
    });

    expect(container.textContent).toContain('No academic years configured');
    expect(container.textContent).toContain('Get started by creating your first academic year.');
  });

  it('supports sorting in AcademicYearsTable by name', async () => {
    const mockYears: AcademicYear[] = [
      { id: 'ay-1', branch_id: 'b-1', name: 'AY 2026-2027', start_date: '2026-06-01', end_date: '2027-03-31', status: 'active' },
      { id: 'ay-2', branch_id: 'b-1', name: 'AY 2025-2026', start_date: '2025-06-01', end_date: '2026-03-31', status: 'archived' },
    ];

    await act(async () => {
      root.render(<AcademicYearsTable data={mockYears} isReadOnly={false} />);
    });

    const nameSortBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Name')
    );
    expect(nameSortBtn).toBeDefined();

    await act(async () => {
      nameSortBtn?.click();
    });

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('renders AcademicYearForm for creating a new academic year and handles submit', async () => {
    const onClose = vi.fn();
    await act(async () => {
      root.render(<AcademicYearForm onClose={onClose} explicitBranchId="b-1" />);
    });

    expect(document.body.textContent).toContain('New Academic Year');
    expect(document.body.querySelector('input[name="name"]')).not.toBeNull();
    expect(document.body.querySelector('input[name="start_date"]')).not.toBeNull();
    expect(document.body.querySelector('input[name="end_date"]')).not.toBeNull();

    const form = document.body.querySelector('form');
    await act(async () => {
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockCreateAcademicYear).toHaveBeenCalled();
  });

  it('renders AcademicYearForm for editing and displays error if submission fails', async () => {
    mockUpdateAcademicYear.mockResolvedValueOnce({ error: 'Academic year date conflict' });
    const onClose = vi.fn();
    const existingYear: AcademicYear = {
      id: 'ay-1',
      branch_id: 'b-1',
      name: 'Existing AY',
      start_date: '2026-06-01',
      end_date: '2027-03-31',
      status: 'active',
    };

    await act(async () => {
      root.render(<AcademicYearForm onClose={onClose} initialData={existingYear} explicitBranchId="b-1" />);
    });

    expect(document.body.textContent).toContain('Edit Academic Year');
    const nameInput = document.body.querySelector('input[name="name"]') as HTMLInputElement;
    expect(nameInput.defaultValue).toBe('Existing AY');

    const form = document.body.querySelector('form');
    await act(async () => {
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(mockUpdateAcademicYear).toHaveBeenCalled();
    expect(document.body.textContent).toContain('Academic year date conflict');
  });
});
