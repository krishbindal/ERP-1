import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Enable React 19 act environment for jsdom
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import {
  Dialog,
  Drawer,
  ToastProvider,
  toast,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Input,
  Select,
} from './index';

vi.mock('lucide-react', () => {
  const createMockIcon = (name: string) => {
    const MockIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
      <svg ref={ref} data-testid={`icon-${name}`} {...props} />
    ));
    MockIcon.displayName = name;
    return MockIcon;
  };
  return {
    Loader2: createMockIcon('loader2'),
    ChevronDown: createMockIcon('chevron-down'),
    CheckCircle: createMockIcon('check-circle'),
    AlertCircle: createMockIcon('alert-circle'),
    AlertTriangle: createMockIcon('alert-triangle'),
    Info: createMockIcon('info'),
    X: createMockIcon('x'),
  };
});

describe('UI Accessibility and Responsiveness Hardening (FRONTEND-10 & FRONTEND-11)', () => {
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

  describe('Dialog Accessibility & Responsive Semantics', () => {
    it('renders with role="dialog", aria-modal="true", and unnested sibling backdrop', async () => {
      await act(async () => {
        root.render(
          <Dialog isOpen={true} onClose={() => {}} title="Accessible Modal" description="Modal details">
            <p>Dialog Body Content</p>
          </Dialog>
        );
      });

      const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
      expect(dialog).not.toBeNull();
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
      expect(dialog.getAttribute('aria-describedby')).toBeTruthy();

      // Ensure dialog itself is NOT wrapped in an element with aria-hidden="true"
      let parent = dialog.parentElement;
      while (parent && parent !== document.body) {
        expect(parent.getAttribute('aria-hidden')).not.toBe('true');
        parent = parent.parentElement;
      }

      // Backdrop overlay must exist as a sibling with aria-hidden="true"
      const backdrop = dialog.parentElement?.querySelector('[aria-hidden="true"]');
      expect(backdrop).not.toBeNull();
    });

    it('enforces min-h-[44px] min-w-[44px] touch target on close button', async () => {
      await act(async () => {
        root.render(
          <Dialog isOpen={true} onClose={() => {}} title="Touch Target Modal">
            <button type="button">Action</button>
          </Dialog>
        );
      });

      const closeBtn = document.querySelector('button[aria-label="Close dialog"]') as HTMLButtonElement;
      expect(closeBtn).not.toBeNull();
      expect(closeBtn.className).toContain('min-h-[44px]');
      expect(closeBtn.className).toContain('min-w-[44px]');
    });

    it('enforces responsive vertical constraints and scrollable container', async () => {
      await act(async () => {
        root.render(
          <Dialog isOpen={true} onClose={() => {}} title="Responsive Modal">
            <p>Long scrollable dialog content</p>
          </Dialog>
        );
      });

      const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
      expect(dialog.className).toContain('max-h-[calc(100vh-2rem)]');
      expect(dialog.className).toContain('flex');
      expect(dialog.className).toContain('flex-col');

      const bodyContainer = dialog.querySelector('.overflow-y-auto');
      expect(bodyContainer).not.toBeNull();
    });

    it('dismisses on Escape key press', async () => {
      const handleClose = vi.fn();
      await act(async () => {
        root.render(
          <Dialog isOpen={true} onClose={handleClose} title="Dismissable Modal">
            <p>Content</p>
          </Dialog>
        );
      });

      await act(async () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('restores focus to previous active element when closing', async () => {
      const triggerBtn = document.createElement('button');
      triggerBtn.textContent = 'Open Dialog';
      document.body.appendChild(triggerBtn);
      triggerBtn.focus();
      expect(document.activeElement).toBe(triggerBtn);

      const handleClose = vi.fn();
      await act(async () => {
        root.render(
          <Dialog isOpen={true} onClose={handleClose} title="Focus Restoration Modal">
            <button id="modal-btn" type="button">Inside Button</button>
          </Dialog>
        );
      });

      // Advance timers to trigger initial focus
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 30));
      });

      // Now close dialog
      await act(async () => {
        root.render(
          <Dialog isOpen={false} onClose={handleClose} title="Focus Restoration Modal">
            <button id="modal-btn" type="button">Inside Button</button>
          </Dialog>
        );
      });

      expect(document.activeElement).toBe(triggerBtn);
      triggerBtn.remove();
    });

    it('traps Tab and Shift+Tab keyboard focus within the dialog', async () => {
      await act(async () => {
        root.render(
          <Dialog isOpen={true} onClose={() => {}} title="Focus Trap Modal">
            <button id="first-btn" type="button">First</button>
            <button id="second-btn" type="button">Second</button>
          </Dialog>
        );
      });

      const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
      const closeBtn = dialog.querySelector('button[aria-label="Close dialog"]') as HTMLElement;
      const firstBtn = document.getElementById('first-btn') as HTMLElement;
      const secondBtn = document.getElementById('second-btn') as HTMLElement;

      expect(firstBtn).not.toBeNull();

      // When focused on the last element (secondBtn) and Tab is pressed, wraps to first focusable element (closeBtn)
      secondBtn.focus();
      expect(document.activeElement).toBe(secondBtn);

      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      await act(async () => {
        document.dispatchEvent(tabEvent);
      });

      expect(document.activeElement).toBe(closeBtn);

      // When focused on first element (closeBtn) and Shift+Tab is pressed, wraps to last element (secondBtn)
      closeBtn.focus();
      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      await act(async () => {
        document.dispatchEvent(shiftTabEvent);
      });

      expect(document.activeElement).toBe(secondBtn);
    });
  });

  describe('Drawer Accessibility & Mobile Responsiveness', () => {
    it('renders with role="dialog", aria-modal="true", and unnested backdrop', async () => {
      await act(async () => {
        root.render(
          <Drawer isOpen={true} onClose={() => {}} title="Responsive Drawer">
            <p>Drawer content</p>
          </Drawer>
        );
      });

      const drawer = document.querySelector('[role="dialog"]') as HTMLElement;
      expect(drawer).not.toBeNull();
      expect(drawer.getAttribute('aria-modal')).toBe('true');
      expect(drawer.getAttribute('aria-labelledby')).toBeTruthy();

      // Ensure drawer is not inside an aria-hidden container
      let parent = drawer.parentElement;
      while (parent && parent !== document.body) {
        expect(parent.getAttribute('aria-hidden')).not.toBe('true');
        parent = parent.parentElement;
      }
    });

    it('enforces mobile responsiveness with max-w-[85vw] constraint', async () => {
      await act(async () => {
        root.render(
          <Drawer isOpen={true} onClose={() => {}} title="Mobile Drawer">
            <p>Drawer content</p>
          </Drawer>
        );
      });

      const drawer = document.querySelector('[role="dialog"]') as HTMLElement;
      expect(drawer.className).toContain('max-w-[85vw]');
      expect(drawer.className).toContain('sm:max-w-md');
    });

    it('provides 44x44px minimum touch target for drawer close button', async () => {
      await act(async () => {
        root.render(
          <Drawer isOpen={true} onClose={() => {}} title="Drawer Touch Target">
            <p>Drawer content</p>
          </Drawer>
        );
      });

      const closeBtn = document.querySelector('button[aria-label="Close drawer"]') as HTMLButtonElement;
      expect(closeBtn).not.toBeNull();
      expect(closeBtn.className).toContain('min-h-[44px]');
      expect(closeBtn.className).toContain('min-w-[44px]');
    });

    it('closes on Escape key press', async () => {
      const handleClose = vi.fn();
      await act(async () => {
        root.render(
          <Drawer isOpen={true} onClose={handleClose} title="Escape Drawer">
            <p>Drawer content</p>
          </Drawer>
        );
      });

      await act(async () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Toast Accessibility & Responsiveness', () => {
    it('dismisses the topmost active toast on Escape key press', async () => {
      await act(async () => {
        root.render(<ToastProvider />);
      });

      let id1 = '';
      await act(async () => {
        id1 = toast.info('First Toast');
        toast.success('Second Toast');
      });

      expect(document.body.textContent).toContain('First Toast');
      expect(document.body.textContent).toContain('Second Toast');

      // Press Escape once -> dismisses newest toast
      await act(async () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      });

      expect(document.body.textContent).not.toContain('Second Toast');
      expect(document.body.textContent).toContain('First Toast');

      // Clean up first toast
      await act(async () => {
        toast.dismiss(id1);
      });
    });

    it('enforces min-h-[44px] min-w-[44px] touch target on dismiss button', async () => {
      await act(async () => {
        root.render(<ToastProvider />);
      });

      let id = '';
      await act(async () => {
        id = toast.warning('Touch Toast');
      });

      const dismissBtn = document.querySelector('button[aria-label="Dismiss notification"]') as HTMLButtonElement;
      expect(dismissBtn).not.toBeNull();
      expect(dismissBtn.className).toContain('min-h-[44px]');
      expect(dismissBtn.className).toContain('min-w-[44px]');

      await act(async () => {
        toast.dismiss(id);
      });
    });

    it('enforces responsive positioning and max-w-[calc(100vw-1rem)]', async () => {
      await act(async () => {
        root.render(<ToastProvider />);
      });

      let id = '';
      await act(async () => {
        id = toast.info('Responsive Toast');
      });

      const toastContainer = document.querySelector('.pointer-events-none.fixed') as HTMLElement;
      expect(toastContainer).not.toBeNull();
      expect(toastContainer.className).toContain('max-w-[calc(100vw-1rem)]');
      expect(toastContainer.className).toContain('sm:max-w-md');

      await act(async () => {
        toast.dismiss(id);
      });
    });
  });

  describe('Table Horizontal Scroll Accessibility & Semantics', () => {
    it('wraps table in a focusable region with accessible label and keyboard navigation', async () => {
      await act(async () => {
        root.render(
          <Table aria-label="Scrollable data table">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Student ID</TableHead>
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Class</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>STD-001</TableCell>
                <TableCell>John Doe</TableCell>
                <TableCell>Grade 10-A</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        );
      });

      const region = container.querySelector('[role="region"]') as HTMLElement;
      expect(region).not.toBeNull();
      expect(region.getAttribute('aria-label')).toBe('Scrollable data table');
      expect(region.getAttribute('tabIndex')).toBe('0');
      expect(region.className).toContain('focus-visible:ring-2');

      const headers = container.querySelectorAll('th');
      headers.forEach((th) => {
        expect(th.getAttribute('scope')).toBe('col');
      });
    });
  });

  describe('Form Controls Accessibility (Input & Select)', () => {
    it('associates Input label with input element via htmlFor and id', async () => {
      await act(async () => {
        root.render(<Input id="test-email" label="Email Address" type="email" />);
      });

      const label = container.querySelector('label[for="test-email"]');
      const input = container.querySelector('input#test-email');
      expect(label).not.toBeNull();
      expect(input).not.toBeNull();
      expect(label?.textContent).toContain('Email Address');
    });

    it('associates Input error state with aria-invalid="true" and aria-describedby', async () => {
      await act(async () => {
        root.render(
          <Input
            id="test-password"
            label="Password"
            type="password"
            error="Password is too weak"
          />
        );
      });

      const input = container.querySelector('input#test-password') as HTMLInputElement;
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe('test-password-error');

      const errorMsg = container.querySelector('#test-password-error') as HTMLElement;
      expect(errorMsg).not.toBeNull();
      expect(errorMsg.getAttribute('role')).toBe('alert');
      expect(errorMsg.textContent).toContain('Password is too weak');
    });

    it('associates Select label, options, and error state properly', async () => {
      await act(async () => {
        root.render(
          <Select
            id="test-gender"
            label="Gender"
            error="Please select a valid gender"
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
          />
        );
      });

      const label = container.querySelector('label[for="test-gender"]');
      const select = container.querySelector('select#test-gender') as HTMLSelectElement;
      expect(label).not.toBeNull();
      expect(select).not.toBeNull();
      expect(select.getAttribute('aria-invalid')).toBe('true');
      expect(select.getAttribute('aria-describedby')).toBe('test-gender-error');

      const errorMsg = container.querySelector('#test-gender-error') as HTMLElement;
      expect(errorMsg).not.toBeNull();
      expect(errorMsg.getAttribute('role')).toBe('alert');
      expect(errorMsg.textContent).toContain('Please select a valid gender');
    });
  });
});
