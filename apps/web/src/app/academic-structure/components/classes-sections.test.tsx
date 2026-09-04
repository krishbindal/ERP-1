import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Enable React 19 act environment for jsdom
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

vi.mock('../actions', () => ({
  deleteClass: vi.fn().mockResolvedValue({ success: true }),
  deleteSection: vi.fn().mockResolvedValue({ success: true }),
  getAcademicYears: vi.fn().mockResolvedValue({ data: [] }),
}));

import { ClassesList } from './ClassesList';
import { SectionsList } from './SectionsList';

describe('ClassesList and SectionsList tables', () => {
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
    document.body.innerHTML = '';
  });

  it('renders ClassesList with accessible headers, search filter, and delete ConfirmDialog', async () => {
    const mockClasses = [
      {
        id: 'cls-1',
        name: 'Grade 10-A',
        level: 10,
        branch_id: 'b-1',
        created_at: '',
        academic_year_id: 'ay-1',
        academic_years: { id: 'ay-1', name: '2026-2027', branch_id: 'b-1', start_date: '', end_date: '', created_at: '' },
      },
      {
        id: 'cls-2',
        name: 'Grade 9-B',
        level: 9,
        branch_id: 'b-1',
        created_at: '',
        academic_year_id: 'ay-1',
        academic_years: { id: 'ay-1', name: '2026-2027', branch_id: 'b-1', start_date: '', end_date: '', created_at: '' },
      },
    ];

    await act(async () => {
      root.render(<ClassesList data={mockClasses} isReadOnly={false} />);
    });

    // Check accessible headers
    const ths = container.querySelectorAll('th');
    expect(ths.length).toBeGreaterThanOrEqual(3);
    ths.forEach((th) => {
      expect(th.getAttribute('scope')).toBe('col');
    });

    // Check rows rendered
    expect(container.textContent).toContain('Grade 10-A');
    expect(container.textContent).toContain('Grade 9-B');

    // Search input filter
    const searchInput = container.querySelector('#class-search') as HTMLInputElement;
    expect(searchInput).not.toBeNull();

    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(searchInput, 'Grade 10');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    });


    expect(container.textContent).toContain('Grade 10-A');
    expect(container.textContent).not.toContain('Grade 9-B');

    // Trigger Delete ConfirmDialog
    const deleteBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Delete')
    );
    expect(deleteBtn).toBeDefined();

    await act(async () => {
      deleteBtn?.click();
    });

    // Confirm dialog should be open
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('Delete Class');
    expect(dialog?.textContent).toContain('Are you sure you want to delete class "Grade 10-A"?');
  });

  it('renders SectionsList with empty state card when 0 sections', async () => {
    await act(async () => {
      root.render(<SectionsList data={[]} isReadOnly={false} />);
    });

    expect(container.textContent).toContain('No sections configured');
    expect(container.textContent).toContain('Get started by creating your first class section.');
  });
});
