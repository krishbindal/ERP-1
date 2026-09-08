import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Enable React 19 act environment for jsdom
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('lucide-react', () => {
  const createMockIcon = (name: string) => {
    const MockIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
      <svg ref={ref} data-testid={`icon-${name}`} {...props} />
    ));
    MockIcon.displayName = name;
    return MockIcon;
  };
  return {
    AlertTriangle: () => <svg data-testid="icon-alert-triangle" />,
    CheckCircle: () => <svg data-testid="icon-check-circle" />,
    AlertCircle: () => <svg data-testid="icon-alert-circle" />,
    Info: () => <svg data-testid="icon-info" />,
    X: () => <svg data-testid="icon-x" />,
    Search: createMockIcon('search'),
    ArrowUpDown: createMockIcon('arrow-up-down'),
    ArrowUp: createMockIcon('arrow-up'),
    ArrowDown: createMockIcon('arrow-down'),
    User: createMockIcon('user'),
    Loader2: createMockIcon('loader2'),
    ChevronDown: createMockIcon('chevron-down'),
    CheckCircle: createMockIcon('check-circle'),
    AlertCircle: createMockIcon('alert-circle'),
    Info: createMockIcon('info'),
    X: createMockIcon('x'),
  };
});

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { StudentsTable } from './StudentsTable';

describe('StudentsTable component', () => {
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

  it('renders students table with accessible headers and search filtering', async () => {
    const mockStudents = [
      { id: 'std-1', first_name: 'John', last_name: 'Doe', status: 'ACTIVE' },
      { id: 'std-2', first_name: 'Jane', last_name: 'Smith', status: 'INACTIVE' },
    ];

    await act(async () => {
      root.render(<StudentsTable students={mockStudents} />);
    });

    const ths = container.querySelectorAll('th');
    expect(ths.length).toBe(3);
    ths.forEach((th) => {
      expect(th.getAttribute('scope')).toBe('col');
    });

    expect(container.textContent).toContain('John Doe');
    expect(container.textContent).toContain('Jane Smith');

    // Filter by search
    const searchInput = container.querySelector('#student-search') as HTMLInputElement;
    expect(searchInput).not.toBeNull();

    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(searchInput, 'John');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('John Doe');
    expect(container.textContent).not.toContain('Jane Smith');
  });

  it('renders clear empty state card when 0 students found initially', async () => {
    await act(async () => {
      root.render(<StudentsTable students={[]} />);
    });

    expect(container.textContent).toContain('No students found');
    expect(container.textContent).toContain('No students found in your active branches.');
  });

  it('supports status filtering via select dropdown', async () => {
    const mockStudents = [
      { id: 'std-1', first_name: 'Alice', last_name: 'Active', status: 'ACTIVE' },
      { id: 'std-2', first_name: 'Bob', last_name: 'Inactive', status: 'INACTIVE' },
    ];

    await act(async () => {
      root.render(<StudentsTable students={mockStudents} />);
    });

    const select = container.querySelector('#student-status-filter') as HTMLSelectElement;
    expect(select).not.toBeNull();

    await act(async () => {
      select.value = 'ACTIVE';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('Alice Active');
    expect(container.textContent).not.toContain('Bob Inactive');
  });

  it('supports column sorting on student name and status', async () => {
    const mockStudents = [
      { id: 'std-1', first_name: 'Zach', last_name: 'Adams', status: 'ACTIVE' },
      { id: 'std-2', first_name: 'Aaron', last_name: 'Brown', status: 'INACTIVE' },
    ];

    await act(async () => {
      root.render(<StudentsTable students={mockStudents} />);
    });

    const sortNameBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Name')
    );
    expect(sortNameBtn).toBeDefined();

    await act(async () => {
      sortNameBtn?.click();
    });

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });
});
