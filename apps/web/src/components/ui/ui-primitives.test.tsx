import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Enable React 19 act environment for jsdom
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
import {
  Button,
  Input,
  Select,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  ConfirmDialog,
  Drawer,
  ToastProvider,
  toast,
  cn,
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

describe('Shared UI Primitives', () => {
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

  describe('cn utility', () => {
    it('merges class strings, objects, and conditional classes correctly', () => {
      expect(cn('base', true && 'is-active', false && 'hidden', null, undefined)).toBe(
        'base is-active'
      );
      expect(cn({ active: true, disabled: false }, ['nested', 'classes'])).toBe(
        'active nested classes'
      );
    });
  });

  describe('Button', () => {
    it('renders default button with accessible attributes and visible focus class', async () => {
      await act(async () => {
        root.render(<Button>Click me</Button>);
      });

      const btn = container.querySelector('button');
      expect(btn).not.toBeNull();
      expect(btn?.textContent).toBe('Click me');
      expect(btn?.type).toBe('button');
      expect(btn?.className).toContain('bg-primary');
      expect(btn?.className).toContain('focus-ring');
      expect(btn?.getAttribute('disabled')).toBeNull();
    });

    it('renders all variants and sizes correctly', async () => {
      await act(async () => {
        root.render(
          <div>
            <Button variant="secondary" size="sm">
              Secondary
            </Button>
            <Button variant="outline" size="lg">
              Outline
            </Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        );
      });

      const buttons = container.querySelectorAll('button');
      expect(buttons[0].className).toContain('bg-secondary');
      expect(buttons[0].className).toContain('h-8');
      expect(buttons[1].className).toContain('border-input');
      expect(buttons[1].className).toContain('h-12');
      expect(buttons[2].className).toContain('bg-destructive');
      expect(buttons[3].className).toContain('hover:bg-muted');
    });

    it('handles isLoading state with aria-busy, aria-disabled, and accessible spinner', async () => {
      const onClick = vi.fn();
      await act(async () => {
        root.render(
          <Button isLoading loadingText="Saving..." onClick={onClick}>
            Submit
          </Button>
        );
      });

      const btn = container.querySelector('button')!;
      expect(btn.getAttribute('aria-busy')).toBe('true');
      expect(btn.getAttribute('aria-disabled')).toBe('true');
      expect(btn.disabled).toBe(true);
      expect(btn.textContent).toContain('Saving...');

      btn.click();
      expect(onClick).not.toHaveBeenCalled();
    });

    it('handles disabled state properly', async () => {
      const onClick = vi.fn();
      await act(async () => {
        root.render(
          <Button disabled onClick={onClick}>
            Disabled
          </Button>
        );
      });

      const btn = container.querySelector('button')!;
      expect(btn.disabled).toBe(true);
      expect(btn.getAttribute('aria-disabled')).toBe('true');
      btn.click();
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Input', () => {
    it('associates label and input via id and htmlFor', async () => {
      await act(async () => {
        root.render(<Input label="Full Name" name="name" />);
      });

      const label = container.querySelector('label')!;
      const input = container.querySelector('input')!;
      expect(label).not.toBeNull();
      expect(input).not.toBeNull();
      expect(label.getAttribute('for')).toBe(input.id);
      expect(label.textContent).toBe('Full Name');
    });

    it('renders error message with role="alert", aria-invalid, and aria-describedby', async () => {
      await act(async () => {
        root.render(<Input label="Email" error="Invalid email address" helperText="Enter your work email" />);
      });

      const input = container.querySelector('input')!;
      const errorP = container.querySelector('[role="alert"]')!;
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(errorP).not.toBeNull();
      expect(errorP.textContent).toBe('Invalid email address');
      expect(input.getAttribute('aria-describedby')).toContain(errorP.id);
    });

    it('renders helperText when error is not present', async () => {
      await act(async () => {
        root.render(<Input label="Username" helperText="Must be 3-20 characters" />);
      });

      const input = container.querySelector('input')!;
      const helperP = container.querySelector('p')!;
      expect(helperP.textContent).toBe('Must be 3-20 characters');
      expect(input.getAttribute('aria-describedby')).toBe(helperP.id);
    });
  });

  describe('Select', () => {
    const options = [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ];

    it('renders select with options and label association', async () => {
      await act(async () => {
        root.render(<Select label="Status" options={options} />);
      });

      const label = container.querySelector('label')!;
      const select = container.querySelector('select')!;
      expect(label.getAttribute('for')).toBe(select.id);
      expect(select.children.length).toBe(2);
      expect(select.children[0].textContent).toBe('Active');
    });

    it('renders error message with role="alert" and aria-invalid', async () => {
      await act(async () => {
        root.render(<Select label="Status" error="Selection required" options={options} />);
      });

      const select = container.querySelector('select')!;
      const errorP = container.querySelector('[role="alert"]')!;
      expect(select.getAttribute('aria-invalid')).toBe('true');
      expect(errorP.textContent).toBe('Selection required');
      expect(select.getAttribute('aria-describedby')).toContain(errorP.id);
    });
  });

  describe('Badge', () => {
    it('renders semantic badge variants', async () => {
      await act(async () => {
        root.render(
          <div>
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        );
      });

      const badges = container.querySelectorAll('span');
      expect(badges[0].className).toContain('bg-secondary');
      expect(badges[1].className).toContain('bg-success');
      expect(badges[2].className).toContain('bg-warning');
      expect(badges[3].className).toContain('bg-destructive');
      expect(badges[4].className).toContain('border-border');
    });
  });

  describe('Card', () => {
    it('renders card and subcomponents with semantic surface tokens', async () => {
      await act(async () => {
        root.render(
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>Card Content Body</CardContent>
            <CardFooter>Card Footer</CardFooter>
          </Card>
        );
      });

      const card = container.firstElementChild as HTMLElement;
      expect(card.className).toContain('bg-surface');
      expect(card.className).toContain('border-border');
      expect(container.querySelector('h3')?.textContent).toBe('Card Title');
      expect(container.querySelector('p')?.textContent).toBe('Card Description');
    });
  });

  describe('Tabs', () => {
    it('renders tabs with role="tablist", role="tab", role="tabpanel" and handles tab switching', async () => {
      await act(async () => {
        root.render(
          <Tabs defaultValue="account">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">Account Content</TabsContent>
            <TabsContent value="password">Password Content</TabsContent>
          </Tabs>
        );
      });

      const tablist = container.querySelector('[role="tablist"]')!;
      expect(tablist).not.toBeNull();

      const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      expect(tabs[0].getAttribute('aria-selected')).toBe('true');
      expect(tabs[0].tabIndex).toBe(0);
      expect(tabs[1].getAttribute('aria-selected')).toBe('false');
      expect(tabs[1].tabIndex).toBe(-1);

      let panel = container.querySelector('[role="tabpanel"]')!;
      expect(panel.textContent).toBe('Account Content');
      expect(panel.id).toBe(tabs[0].getAttribute('aria-controls'));

      // Click second tab
      await act(async () => {
        tabs[1].click();
      });

      expect(tabs[0].getAttribute('aria-selected')).toBe('false');
      expect(tabs[1].getAttribute('aria-selected')).toBe('true');
      panel = container.querySelector('[role="tabpanel"]')!;
      expect(panel.textContent).toBe('Password Content');
    });

    it('supports keyboard navigation in tablist (ArrowRight, ArrowLeft, Home, End)', async () => {
      await act(async () => {
        root.render(
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Tab 1</TabsTrigger>
              <TabsTrigger value="tab2">Tab 2</TabsTrigger>
              <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Panel 1</TabsContent>
            <TabsContent value="tab2">Panel 2</TabsContent>
            <TabsContent value="tab3">Panel 3</TabsContent>
          </Tabs>
        );
      });

      const tablist = container.querySelector<HTMLDivElement>('[role="tablist"]')!;
      const tabs = container.querySelectorAll<HTMLButtonElement>('[role="tab"]');

      tabs[0].focus();

      // ArrowRight to next tab
      await act(async () => {
        tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      });
      expect(tabs[1].getAttribute('aria-selected')).toBe('true');

      // End to last tab
      await act(async () => {
        tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      });
      expect(tabs[2].getAttribute('aria-selected')).toBe('true');

      // Home to first tab
      await act(async () => {
        tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      });
      expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('Dialog', () => {
    it('does not render dialog in DOM when isOpen is false', async () => {
      await act(async () => {
        root.render(
          <Dialog isOpen={false} onClose={vi.fn()} title="Test Dialog">
            Dialog content
          </Dialog>
        );
      });

      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });

    it('renders dialog with accessible attributes when isOpen is true', async () => {
      const onClose = vi.fn();
      await act(async () => {
        root.render(
          <Dialog isOpen={true} onClose={onClose} title="Test Modal" description="Modal description">
            Modal body
          </Dialog>
        );
      });

      const dialog = document.querySelector('[role="dialog"]')!;
      expect(dialog).not.toBeNull();
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.textContent).toContain('Test Modal');
      expect(dialog.textContent).toContain('Modal description');
      expect(dialog.textContent).toContain('Modal body');

      const closeBtn = document.querySelector('button[aria-label="Close dialog"]') as HTMLButtonElement;
      expect(closeBtn).not.toBeNull();
      await act(async () => {
        closeBtn.click();
      });
      expect(onClose).toHaveBeenCalled();
    });

    it('handles Escape key press to close dialog', async () => {
      const onClose = vi.fn();
      await act(async () => {
        root.render(
          <Dialog isOpen={true} onClose={onClose} title="Escape Modal">
            Body
          </Dialog>
        );
      });

      await act(async () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('ConfirmDialog', () => {
    it('renders confirmation dialog and handles cancel and confirm actions', async () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();

      await act(async () => {
        root.render(
          <ConfirmDialog
            isOpen={true}
            onClose={onClose}
            onConfirm={onConfirm}
            title="Delete Item"
            message="Are you sure you want to delete this item?"
            isDestructive={true}
          />
        );
      });

      const dialog = document.querySelector('[role="dialog"]')!;
      expect(dialog).not.toBeNull();
      expect(dialog.textContent).toContain('Delete Item');
      expect(dialog.textContent).toContain('Are you sure you want to delete this item?');

      const buttons = dialog.querySelectorAll('button');
      const cancelBtn = Array.from(buttons).find((b) => b.textContent?.includes('Cancel'))!;
      const deleteBtn = Array.from(buttons).find((b) => b.textContent?.includes('Delete'))!;

      expect(cancelBtn).not.toBeNull();
      expect(deleteBtn).not.toBeNull();
      expect(deleteBtn.className).toContain('bg-destructive');

      await act(async () => {
        deleteBtn.click();
      });
      expect(onConfirm).toHaveBeenCalled();

      await act(async () => {
        cancelBtn.click();
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Drawer', () => {
    it('renders drawer with accessible sheet dialog attributes', async () => {
      const onClose = vi.fn();
      await act(async () => {
        root.render(
          <Drawer isOpen={true} onClose={onClose} title="Side Navigation" side="left">
            Drawer Nav List
          </Drawer>
        );
      });

      const drawer = document.querySelector('[role="dialog"]')!;
      expect(drawer).not.toBeNull();
      expect(drawer.getAttribute('aria-modal')).toBe('true');
      expect(drawer.className).toContain('left-0');
      expect(drawer.textContent).toContain('Side Navigation');

      const closeBtn = document.querySelector('button[aria-label="Close drawer"]') as HTMLButtonElement;
      await act(async () => {
        closeBtn.click();
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Toast', () => {
    it('dispatches and renders toast notifications with role="status" and role="alert"', async () => {
      await act(async () => {
        root.render(<ToastProvider position="bottom-right" />);
      });

      let toastId: string;
      await act(async () => {
        toastId = toast.success('Record saved successfully!');
      });

      const toastEl = document.querySelector('[role="status"]')!;
      expect(toastEl).not.toBeNull();
      expect(toastEl.textContent).toContain('Record saved successfully!');

      await act(async () => {
        toast.dismiss(toastId);
      });
      expect(document.querySelector('[role="status"]')).toBeNull();

      // Error toast has role="alert"
      await act(async () => {
        toast.error('Failed to save record.');
      });

      const alertToast = document.querySelector('[role="alert"]')!;
      expect(alertToast).not.toBeNull();
      expect(alertToast.textContent).toContain('Failed to save record.');
    });
  });
});
