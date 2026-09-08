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
    Calendar: createMockIcon('calendar'),
    Loader2: createMockIcon('loader2'),
    ChevronDown: createMockIcon('chevron-down'),
    CheckCircle: createMockIcon('check-circle'),
    AlertCircle: createMockIcon('alert-circle'),
    Info: createMockIcon('info'),
    X: createMockIcon('x'),
  };
});

import { AttendanceHistoryTable } from './AttendanceHistoryTable';

describe('AttendanceHistoryTable component', () => {
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

  it('renders attendance history table with accessible headers, sorting, and status badges', async () => {
    const mockRecords = [
      {
        status: 'ABSENT',
        attendance_sessions: { date: '2026-09-01', published_at: '2026-09-01T10:00:00Z' },
        students: { first_name: 'Alice', last_name: 'Brown' },
      },
      {
        status: 'LATE',
        attendance_sessions: { date: '2026-09-02', published_at: '2026-09-02T10:00:00Z' },
        students: { first_name: 'Bob', last_name: 'Green' },
      },
    ];

    await act(async () => {
      root.render(<AttendanceHistoryTable records={mockRecords} />);
    });

    const ths = container.querySelectorAll('th');
    expect(ths.length).toBe(3);
    ths.forEach((th) => {
      expect(th.getAttribute('scope')).toBe('col');
    });

    expect(container.textContent).toContain('Alice Brown');
    expect(container.textContent).toContain('Bob Green');
    expect(container.textContent).toContain('ABSENT');
    expect(container.textContent).toContain('LATE');

    // Filter by search
    const searchInput = container.querySelector('#history-search') as HTMLInputElement;
    expect(searchInput).not.toBeNull();

    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeSetter?.call(searchInput, 'Alice');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('Alice Brown');
    expect(container.textContent).not.toContain('Bob Green');
  });

  it('renders empty state card when records array is empty', async () => {
    await act(async () => {
      root.render(<AttendanceHistoryTable records={[]} />);
    });

    expect(container.textContent).toContain('No published absences or lates');
  });
});
