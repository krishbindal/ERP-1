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

vi.mock('../actions', () => ({
  deleteBellSchedule: vi.fn().mockResolvedValue({ success: true }),
  deletePeriod: vi.fn().mockResolvedValue({ success: true }),
  deleteRoom: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../timetable/actions', () => ({
  createTimetableEntry: vi.fn().mockResolvedValue({ success: true }),
  updateTimetableEntry: vi.fn().mockResolvedValue({ success: true }),
  archiveTimetableEntry: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/app/scheduling/timetable/actions', () => ({
  createTimetableEntry: vi.fn().mockResolvedValue({ success: true }),
  updateTimetableEntry: vi.fn().mockResolvedValue({ success: true }),
  archiveTimetableEntry: vi.fn().mockResolvedValue({ success: true }),
}));

import { BellSchedulesTable } from './BellSchedulesTable';
import { PeriodsTable } from './PeriodsTable';
import { RoomsTable } from './RoomsTable';
import { TimetableEntryForm } from '../timetable/components/TimetableEntryForm';
import { BellSchedule, Period, Room } from './types';

describe('Scheduling secondary tables and timetable form', () => {
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

  describe('BellSchedulesTable', () => {
    const mockSchedules: BellSchedule[] = [
      { id: 'bs-1', branch_id: 'b-1', name: 'Standard Day', status: 'active' },
      { id: 'bs-2', branch_id: 'b-1', name: 'Exam Day', status: 'archived' },
    ];

    it('renders with accessible headers, search filter, and delete ConfirmDialog', async () => {
      await act(async () => {
        root.render(<BellSchedulesTable data={mockSchedules} isReadOnly={false} />);
      });

      const ths = container.querySelectorAll('th');
      expect(ths.length).toBeGreaterThanOrEqual(2);
      ths.forEach((th) => {
        expect(th.getAttribute('scope')).toBe('col');
      });

      expect(container.textContent).toContain('Standard Day');
      expect(container.textContent).toContain('Exam Day');

      // Test search filter
      const searchInput = container.querySelector('#bell-schedule-search') as HTMLInputElement;
      expect(searchInput).not.toBeNull();

      await act(async () => {
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;
        nativeSetter?.call(searchInput, 'Standard');
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      });

      expect(container.textContent).toContain('Standard Day');
      expect(container.textContent).not.toContain('Exam Day');

      // Trigger delete dialog
      const deleteBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Delete')
      );
      expect(deleteBtn).toBeDefined();

      await act(async () => {
        deleteBtn?.click();
      });

      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog?.textContent).toContain('Delete Bell Schedule');
      expect(dialog?.textContent).toContain('Are you sure you want to delete bell schedule "Standard Day"?');
    });

    it('renders empty state when 0 schedules', async () => {
      await act(async () => {
        root.render(<BellSchedulesTable data={[]} isReadOnly={false} />);
      });

      expect(container.textContent).toContain('No bell schedules configured');
    });
  });

  describe('PeriodsTable', () => {
    const mockSchedules: BellSchedule[] = [
      { id: 'bs-1', branch_id: 'b-1', name: 'Standard Day', status: 'active' },
    ];
    const mockPeriods: Period[] = [
      {
        id: 'p-1',
        branch_id: 'b-1',
        bell_schedule_id: 'bs-1',
        name: 'Period 1',
        start_time: '08:00',
        end_time: '08:45',
        status: 'active',
        bell_schedules: { name: 'Standard Day' },
      },
      {
        id: 'p-2',
        branch_id: 'b-1',
        bell_schedule_id: 'bs-1',
        name: 'Period 2',
        start_time: '08:50',
        end_time: '09:35',
        status: 'active',
        bell_schedules: { name: 'Standard Day' },
      },
    ];

    it('renders with accessible headers, search filter, and delete ConfirmDialog', async () => {
      await act(async () => {
        root.render(<PeriodsTable data={mockPeriods} schedules={mockSchedules} isReadOnly={false} />);
      });

      const ths = container.querySelectorAll('th');
      expect(ths.length).toBeGreaterThanOrEqual(5);
      ths.forEach((th) => {
        expect(th.getAttribute('scope')).toBe('col');
      });

      expect(container.textContent).toContain('Period 1');
      expect(container.textContent).toContain('Period 2');

      // Filter
      const searchInput = container.querySelector('#period-search') as HTMLInputElement;
      expect(searchInput).not.toBeNull();

      await act(async () => {
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;
        nativeSetter?.call(searchInput, 'Period 1');
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      });

      expect(container.textContent).toContain('Period 1');
      expect(container.textContent).not.toContain('Period 2');

      // Trigger delete dialog
      const deleteBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Delete')
      );
      expect(deleteBtn).toBeDefined();

      await act(async () => {
        deleteBtn?.click();
      });

      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog?.textContent).toContain('Delete Period');
      expect(dialog?.textContent).toContain('Are you sure you want to delete period "Period 1" (08:00 - 08:45)?');
    });

    it('renders empty state when 0 periods', async () => {
      await act(async () => {
        root.render(<PeriodsTable data={[]} schedules={mockSchedules} isReadOnly={false} />);
      });

      expect(container.textContent).toContain('No periods configured');
    });
  });

  describe('RoomsTable', () => {
    const mockRooms: Room[] = [
      { id: 'r-1', branch_id: 'b-1', name: 'Science Lab 101', capacity: 30, status: 'active' },
      { id: 'r-2', branch_id: 'b-1', name: 'Math Room 204', capacity: 25, status: 'active' },
    ];

    it('renders with accessible headers, search filter, and delete ConfirmDialog', async () => {
      await act(async () => {
        root.render(<RoomsTable data={mockRooms} isReadOnly={false} />);
      });

      const ths = container.querySelectorAll('th');
      expect(ths.length).toBeGreaterThanOrEqual(3);
      ths.forEach((th) => {
        expect(th.getAttribute('scope')).toBe('col');
      });

      expect(container.textContent).toContain('Science Lab 101');
      expect(container.textContent).toContain('Math Room 204');

      // Filter
      const searchInput = container.querySelector('#room-search') as HTMLInputElement;
      expect(searchInput).not.toBeNull();

      await act(async () => {
        const nativeSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;
        nativeSetter?.call(searchInput, 'Science');
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      });

      expect(container.textContent).toContain('Science Lab 101');
      expect(container.textContent).not.toContain('Math Room 204');

      // Trigger delete dialog
      const deleteBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Delete')
      );
      expect(deleteBtn).toBeDefined();

      await act(async () => {
        deleteBtn?.click();
      });

      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog?.textContent).toContain('Delete Room');
      expect(dialog?.textContent).toContain('Are you sure you want to delete room "Science Lab 101"?');
    });

    it('renders empty state when 0 rooms', async () => {
      await act(async () => {
        root.render(<RoomsTable data={[]} isReadOnly={false} />);
      });

      expect(container.textContent).toContain('No rooms configured');
    });
  });

  describe('TimetableEntryForm ConfirmDialog', () => {
    it('opens accessible ConfirmDialog on archive without native confirm', async () => {
      const mockEntry = {
        id: 'tte-1',
        branch_id: 'b-1',
        class_id: 'cls-1',
        section_id: 'sec-1',
        subject_id: 'sub-1',
        period_id: 'p-1',
        room_id: 'r-1',
        staff_branch_profile_id: 'sbp-1',
        day_of_week: 1,
        time_range: '08:00 - 08:45',
        status: 'ACTIVE',
      };

      await act(async () => {
        root.render(
          <TimetableEntryForm
            branchId="b-1"
            periods={[]}
            rooms={[]}
            classes={[]}
            sections={[]}
            subjects={[]}
            teachers={[]}
            initialData={mockEntry}
            triggerOpen={true}
          />
        );
      });

      // Drawer renders via portal into document.body
      const archiveBtn = Array.from(document.body.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Archive Entry')
      );
      expect(archiveBtn).toBeDefined();

      await act(async () => {
        archiveBtn?.click();
      });

      // Check that ConfirmDialog opened with accessible dialog role
      const dialogs = document.querySelectorAll('[role="dialog"]');
      const confirmDialog = Array.from(dialogs).find((d) =>
        d.textContent?.includes('Archive Timetable Entry')
      );
      expect(confirmDialog).toBeDefined();
      expect(confirmDialog?.textContent).toContain('Are you sure you want to archive this timetable entry?');
    });
  });
});
