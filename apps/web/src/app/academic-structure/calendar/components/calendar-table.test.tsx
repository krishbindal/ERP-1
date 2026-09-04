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
    Loader2: createMockIcon('loader2'),
    ChevronDown: createMockIcon('chevron-down'),
    CheckCircle: createMockIcon('check-circle'),
    AlertCircle: createMockIcon('alert-circle'),
    AlertTriangle: createMockIcon('alert-triangle'),
    Info: createMockIcon('info'),
    X: createMockIcon('x'),
  };
});

vi.mock('@/lib/calendar/actions', () => ({
  archiveCalendarEvent: vi.fn().mockResolvedValue({ success: true }),
  createCalendarEvent: vi.fn().mockResolvedValue({ success: true }),
  updateCalendarEvent: vi.fn().mockResolvedValue({ success: true }),
}));

import { CalendarEventsTable } from './CalendarEventsTable';
import { EventModal } from './EventModal';
import { CalendarEvent } from '@/lib/calendar/resolver';

describe('CalendarEventsTable and EventModal', () => {
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

  it('renders CalendarEventsTable with accessible headers, search, and archive ConfirmDialog', async () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: 'evt-1',
        name: 'Spring Break',
        start_date: '2026-03-20',
        end_date: '2026-03-25',
        type: 'HOLIDAY',
        is_instructional: false,
      },
    ];


    await act(async () => {
      root.render(<CalendarEventsTable events={mockEvents} isReadOnly={false} />);
    });

    // Check accessible headers
    const ths = container.querySelectorAll('th');
    expect(ths.length).toBeGreaterThanOrEqual(4);
    ths.forEach((th) => {
      expect(th.getAttribute('scope')).toBe('col');
    });

    expect(container.textContent).toContain('Spring Break');

    // Archive button triggers ConfirmDialog
    const archiveBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Archive')
    );
    expect(archiveBtn).toBeDefined();

    await act(async () => {
      archiveBtn?.click();
    });

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('Archive Calendar Event');
    expect(dialog?.textContent).toContain('Are you sure you want to archive event "Spring Break"?');
  });

  it('renders EventModal and shows discard confirmation when dirty', async () => {
    const onClose = vi.fn();

    await act(async () => {
      root.render(
        <EventModal
          onClose={onClose}
          initialData={null}
        />
      );
    });

    // Type in name to make dirty
    const nameInput = document.querySelector('#event-name') as HTMLInputElement;
    expect(nameInput).not.toBeNull();

    await act(async () => {
      nameInput.value = 'New Winter Holiday';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nameInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Click close/cancel on the drawer
    const closeBtn = document.querySelector('button[aria-label="Close"]') as HTMLButtonElement;
    if (closeBtn) {
      await act(async () => {
        closeBtn.click();
      });

      // Confirm dialog for discard should appear
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog?.textContent).toContain('Discard Unsaved Changes');
    }
  });
});
