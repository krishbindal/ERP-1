import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TimetableGrid, TimetableEntry, Period } from './TimetableGrid';
import TimetableLoading from '../loading';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('TimetableGrid & TimetableLoading Component Tests', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  const mockPeriods: Period[] = [
    { id: 'p1', name: 'Period 1', start_time: '08:00', end_time: '08:50' },
    { id: 'p2', name: 'Period 2', start_time: '09:00', end_time: '09:50' },
  ];

  const mockEntries: TimetableEntry[] = [
    {
      id: 'entry-1',
      day_of_week: 1, // Monday
      time_range: '08:00 - 08:50',
      period_id: 'p1',
      periods: { name: 'Period 1', start_time: '08:00', end_time: '08:50' },
      subjects: { name: 'Mathematics' },
      rooms: { name: 'Room 101' },
      classes: { name: 'Grade 10' },
      sections: { name: 'Section A' },
      staff_branch_profiles: {
        staff: { first_name: 'Jane', last_name: 'Doe' },
      },
    },
    {
      id: 'entry-2',
      day_of_week: 2, // Tuesday
      time_range: '09:00 - 09:50',
      period_id: 'p2',
      periods: { name: 'Period 2', start_time: '09:00', end_time: '09:50' },
      subjects: { name: 'Physics' },
      rooms: { name: 'Lab 1' },
      classes: { name: 'Grade 11' },
      sections: { name: 'Section B' },
      is_substitution: true,
      substitution_id: 'sub-xyz',
      staff_branch_profiles: {
        staff: { first_name: 'Alan', last_name: 'Turing' },
      },
    },
  ];

  it('renders accessible horizontal scroll container with role="region" and tabIndex={0}', async () => {
    await act(async () => {
      root.render(<TimetableGrid entries={mockEntries} periods={mockPeriods} />);
    });

    const scrollRegion = container.querySelector('[role="region"][aria-label="Timetable Schedule Grid"]');
    expect(scrollRegion).not.toBeNull();
    expect(scrollRegion?.getAttribute('tabIndex')).toBe('0');
    expect(scrollRegion?.className).toContain('overflow-x-auto');
  });

  it('renders all 7 day headers with uppercase labels', async () => {
    await act(async () => {
      root.render(<TimetableGrid entries={mockEntries} periods={mockPeriods} />);
    });

    expect(container.textContent).toContain('Monday');
    expect(container.textContent).toContain('Tuesday');
    expect(container.textContent).toContain('Wednesday');
    expect(container.textContent).toContain('Thursday');
    expect(container.textContent).toContain('Friday');
    expect(container.textContent).toContain('Saturday');
    expect(container.textContent).toContain('Sunday');
  });

  it('renders scheduled entry cards with subject, teacher, room, and classes', async () => {
    await act(async () => {
      root.render(<TimetableGrid entries={mockEntries} periods={mockPeriods} />);
    });

    expect(container.textContent).toContain('Mathematics');
    expect(container.textContent).toContain('Jane Doe');
    expect(container.textContent).toContain('Room 101');
    expect(container.textContent).toContain('Grade 10 • Section A');
  });

  it('renders substitution badge [SUB] for substituted entries', async () => {
    await act(async () => {
      root.render(<TimetableGrid entries={mockEntries} periods={mockPeriods} />);
    });

    expect(container.textContent).toContain('Physics');
    expect(container.textContent).toContain('SUB');
    expect(container.textContent).toContain('Alan Turing');
  });

  it('renders empty slot indicators for periods without scheduled classes', async () => {
    await act(async () => {
      root.render(<TimetableGrid entries={mockEntries} periods={mockPeriods} />);
    });

    // Monday (day 1) has p1 scheduled, so p2 should be empty
    const emptySlotMonP2 = container.querySelector('[data-testid="empty-slot-1-p2"]');
    expect(emptySlotMonP2).not.toBeNull();
    expect(emptySlotMonP2?.textContent).toContain('Free Slot');

    // Tuesday (day 2) has p2 scheduled, so p1 should be empty
    const emptySlotTueP1 = container.querySelector('[data-testid="empty-slot-2-p1"]');
    expect(emptySlotTueP1).not.toBeNull();
  });

  it('renders global empty state indicator when no entries are scheduled', async () => {
    await act(async () => {
      root.render(<TimetableGrid entries={[]} periods={mockPeriods} />);
    });

    const emptyState = container.querySelector('[data-testid="timetable-empty-state"]');
    expect(emptyState).not.toBeNull();
    expect(emptyState?.textContent).toContain('No Classes Scheduled');
  });

  it('handles click events on entry cards when not in readOnly mode', async () => {
    const handleEntryClick = vi.fn();

    await act(async () => {
      root.render(
        <TimetableGrid
          entries={mockEntries}
          periods={mockPeriods}
          onEntryClick={handleEntryClick}
        />
      );
    });

    const entryButtons = container.querySelectorAll('[data-testid="timetable-entry"]');
    expect(entryButtons.length).toBe(2);

    await act(async () => {
      (entryButtons[0] as HTMLButtonElement).click();
    });

    expect(handleEntryClick).toHaveBeenCalledTimes(1);
    expect(handleEntryClick).toHaveBeenCalledWith(mockEntries[0]);
  });

  it('renders TimetableLoading skeleton with correct accessibility and test ID', async () => {
    await act(async () => {
      root.render(<TimetableLoading />);
    });

    const skeleton = container.querySelector('[data-testid="timetable-loading-skeleton"]');
    expect(skeleton).not.toBeNull();
    const region = skeleton?.querySelector('[role="region"][aria-label="Loading timetable schedule"]');
    expect(region).not.toBeNull();
    expect(region?.getAttribute('tabIndex')).toBe('0');
  });
});
