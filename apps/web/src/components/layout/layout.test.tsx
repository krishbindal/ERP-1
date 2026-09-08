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
    LayoutDashboard: createMockIcon('layout-dashboard'),
    BookOpen: createMockIcon('book-open'),
    Users: createMockIcon('users'),
    CalendarDays: createMockIcon('calendar-days'),
    CalendarSync: createMockIcon('calendar-sync'),
    Clock: createMockIcon('clock'),
    User: createMockIcon('user'),
    LogOut: createMockIcon('logout'),
    Menu: createMockIcon('menu'),
    X: createMockIcon('x'),
    MessageSquare: createMockIcon('message-square'),
  };
});

let mockPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
    'aria-current': ariaCurrent,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }) => (
    <a href={href} className={className} aria-current={ariaCurrent} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [{ id: 'b1', name: 'Branch Alpha' }] }),
        }),
      }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null } }),
    },
  }),
}));

import { AppShell, isUnauthenticatedRoute } from './AppShell';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { navItems, isLinkActive } from './nav-items';
import type { AppContext } from '@/lib/branch-context';

describe('Layout & Shell Architecture Tests', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockPathname = '/';
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

  describe('isUnauthenticatedRoute', () => {
    it('correctly identifies /login as unauthenticated', () => {
      expect(isUnauthenticatedRoute('/login')).toBe(true);
      expect(isUnauthenticatedRoute('/login/')).toBe(true);
      expect(isUnauthenticatedRoute('/login/callback')).toBe(true);
    });

    it('correctly identifies /auth/* routes as unauthenticated, excluding /auth/logout', () => {
      expect(isUnauthenticatedRoute('/auth/update-password')).toBe(true);
      expect(isUnauthenticatedRoute('/auth/reset-password')).toBe(true);
      expect(isUnauthenticatedRoute('/auth/confirm')).toBe(true);
      expect(isUnauthenticatedRoute('/auth/callback')).toBe(true);

      // /auth/logout must NOT be treated as unauthenticated route
      expect(isUnauthenticatedRoute('/auth/logout')).toBe(false);
      expect(isUnauthenticatedRoute('/auth/logout/')).toBe(false);
    });

    it('correctly identifies authenticated routes as authenticated (false)', () => {
      expect(isUnauthenticatedRoute('/')).toBe(false);
      expect(isUnauthenticatedRoute('/academic-structure')).toBe(false);
      expect(isUnauthenticatedRoute('/students')).toBe(false);
      expect(isUnauthenticatedRoute('/scheduling')).toBe(false);
      expect(isUnauthenticatedRoute('/admin/app-config')).toBe(false);
      expect(isUnauthenticatedRoute(null)).toBe(false);
    });
  });

  describe('isLinkActive', () => {
    it('matches root route / exactly', () => {
      expect(isLinkActive('/', '/')).toBe(true);
      expect(isLinkActive('/', '/students')).toBe(false);
      expect(isLinkActive('/', '/scheduling')).toBe(false);
      expect(isLinkActive('/', null)).toBe(false);
    });

    it('matches exact and sub-routes for feature modules', () => {
      expect(isLinkActive('/students', '/students')).toBe(true);
      expect(isLinkActive('/students', '/students/new')).toBe(true);
      expect(isLinkActive('/students', '/students/123')).toBe(true);
      expect(isLinkActive('/students', '/attendance')).toBe(false);
    });

    it('disambiguates parent and child nav routes', () => {
      // /scheduling vs /scheduling/timetable vs /scheduling/substitutions
      expect(isLinkActive('/scheduling', '/scheduling')).toBe(true);
      expect(isLinkActive('/scheduling', '/scheduling/rooms')).toBe(true);
      expect(isLinkActive('/scheduling', '/scheduling/timetable')).toBe(false);
      expect(isLinkActive('/scheduling/timetable', '/scheduling/timetable')).toBe(true);
      expect(isLinkActive('/scheduling/substitutions', '/scheduling/substitutions')).toBe(true);
    });
  });

  describe('AppShell (DEF-01 Leakage Protection)', () => {
    it('renders clean container without sidebar or topbar on /login', async () => {
      mockPathname = '/login';

      await act(async () => {
        root.render(
          <AppShell>
            <div data-testid="login-content">Login Form</div>
          </AppShell>
        );
      });

      // Must render clean container
      const main = container.querySelector('main');
      expect(main).not.toBeNull();
      expect(main?.className).toContain('min-h-screen bg-background');
      expect(container.querySelector('[data-testid="login-content"]')).not.toBeNull();

      // Must NOT render authenticated chrome
      expect(container.querySelector('aside')).toBeNull();
      expect(container.querySelector('header')).toBeNull();
      expect(container.querySelector('button[aria-label="Open navigation menu"]')).toBeNull();
    });

    it('renders clean container without sidebar or topbar on /auth/update-password', async () => {
      mockPathname = '/auth/update-password';

      await act(async () => {
        root.render(
          <AppShell>
            <div data-testid="password-content">Update Password Form</div>
          </AppShell>
        );
      });

      const main = container.querySelector('main');
      expect(main).not.toBeNull();
      expect(main?.className).toContain('min-h-screen bg-background');
      expect(container.querySelector('[data-testid="password-content"]')).not.toBeNull();

      expect(container.querySelector('aside')).toBeNull();
      expect(container.querySelector('header')).toBeNull();
    });

    it('renders authenticated layout with sidebar and topbar on dashboard /', async () => {
      mockPathname = '/';

      await act(async () => {
        root.render(
          <AppShell>
            <div data-testid="dashboard-content">Dashboard Content</div>
          </AppShell>
        );
      });

      expect(container.querySelector('aside')).not.toBeNull();
      expect(container.querySelector('header')).not.toBeNull();
      expect(container.querySelector('[data-testid="dashboard-content"]')).not.toBeNull();
    });

    it('renders authenticated layout on /auth/logout (action route exclusion)', async () => {
      mockPathname = '/auth/logout';

      await act(async () => {
        root.render(
          <AppShell>
            <div data-testid="logout-content">Logging out...</div>
          </AppShell>
        );
      });

      expect(container.querySelector('aside')).not.toBeNull();
      expect(container.querySelector('header')).not.toBeNull();
    });
  });

  describe('Sidebar (DEF-08 Accessibility & Logout Preservation)', () => {
    it('includes <nav aria-label="Main navigation"> landmark semantics', async () => {
      mockPathname = '/';

      await act(async () => {
        root.render(<Sidebar />);
      });

      const nav = container.querySelector('nav[aria-label="Main navigation"]');
      expect(nav).not.toBeNull();
    });

    it('sets aria-current="page" on the active navigation link', async () => {
      mockPathname = '/students';

      await act(async () => {
        root.render(<Sidebar />);
      });

      const activeLink = container.querySelector('a[aria-current="page"]');
      expect(activeLink).not.toBeNull();
      expect(activeLink?.getAttribute('href')).toBe('/students');

      const dashboardLink = container.querySelector('a[href="/"]');
      expect(dashboardLink?.getAttribute('aria-current')).toBeNull();
    });

    it('applies focus-ring to navigation links', async () => {
      await act(async () => {
        root.render(<Sidebar />);
      });

      const links = container.querySelectorAll('nav a');
      expect(links.length).toBe(navItems.length);
      links.forEach((link) => {
        expect(link.className).toContain('focus-ring');
      });
    });

    it('strictly preserves logout POST form and adds aria-label to button', async () => {
      await act(async () => {
        root.render(<Sidebar userEmail="teacher@school.org" />);
      });

      const form = container.querySelector('form[action="/auth/logout"]');
      expect(form).not.toBeNull();
      expect(form?.getAttribute('method')).toBe('POST');

      const button = form?.querySelector('button[type="submit"]');
      expect(button).not.toBeNull();
      expect(button?.getAttribute('aria-label')).toBe('Log out');
      expect(button?.className).toContain('focus-ring');
    });

    it('displays user email in profile area, or falls back to Profile', async () => {
      await act(async () => {
        root.render(<Sidebar userEmail="admin@school.org" />);
      });
      expect(container.textContent).toContain('admin@school.org');

      await act(async () => {
        root.render(<Sidebar />);
      });
      expect(container.textContent).toContain('Profile');
    });
  });

  describe('TopBar & Mobile Navigation Drawer (DEF-02)', () => {
    it('renders mobile hamburger button with aria-label="Open navigation menu"', async () => {
      await act(async () => {
        root.render(<TopBar />);
      });

      const hamburger = container.querySelector('button[aria-label="Open navigation menu"]');
      expect(hamburger).not.toBeNull();
      expect(hamburger?.className).toContain('md:hidden');
      expect(hamburger?.className).toContain('focus-ring');
    });

    it('displays normal branch context in topbar', async () => {
      const mockContext: AppContext = {
        type: 'normal',
        userId: 'user-1',
        organizationId: 'org-1',
        branchId: 'branch-1',
        branchName: 'North Campus',
        roles: ['teacher'],
      };

      await act(async () => {
        root.render(<TopBar context={mockContext} userEmail="teacher@school.org" />);
      });

      expect(container.textContent).toContain('North Campus');
      expect(container.textContent).toContain('teacher@school.org');
    });

    it('displays SuperAdmin branch context in topbar and drawer', async () => {
      const mockContext: AppContext = {
        type: 'superadmin',
        userId: 'admin-1',
        organizationScopes: ['org-1'],
        roles: ['superadmin'],
      };

      await act(async () => {
        root.render(<TopBar context={mockContext} userEmail="super@school.org" />);
      });

      expect(container.textContent).toContain('Super Admin');
      expect(container.querySelector('select[aria-label="Branch"]')).not.toBeNull();
    });

    it('displays fallback when no branch context is present', async () => {
      await act(async () => {
        root.render(<TopBar context={null} userEmail={null} />);
      });

      expect(container.textContent).toContain('No Branch Assigned');
      expect(container.textContent).toContain('User');
    });

    it('opens mobile drawer when hamburger button is clicked and supports closing via link click', async () => {
      mockPathname = '/scheduling';

      const mockContext: AppContext = {
        type: 'normal',
        userId: 'user-1',
        organizationId: 'org-1',
        branchId: 'branch-1',
        branchName: 'Downtown Academy',
        roles: ['branchadmin'],
      };

      await act(async () => {
        root.render(<TopBar context={mockContext} userEmail="admin@downtown.org" />);
      });

      const hamburger = container.querySelector('button[aria-label="Open navigation menu"]') as HTMLButtonElement;
      expect(hamburger).not.toBeNull();

      // Click to open drawer
      await act(async () => {
        hamburger.click();
      });

      // Drawer is portaled to document.body
      const drawer = document.body.querySelector('div[role="dialog"][aria-modal="true"]');
      expect(drawer).not.toBeNull();

      // Drawer must contain branch context
      expect(drawer?.textContent).toContain('Downtown Academy');

      // Drawer must contain complete navigation list
      const drawerNavLinks = drawer?.querySelectorAll('nav a');
      expect(drawerNavLinks?.length).toBe(navItems.length);

      // Active link must have aria-current="page"
      const activeLink = drawer?.querySelector('a[aria-current="page"]');
      expect(activeLink?.getAttribute('href')).toBe('/scheduling');

      // Drawer must contain profile section
      expect(drawer?.textContent).toContain('admin@downtown.org');

      // Drawer must contain preserved logout POST form
      const logoutForm = drawer?.querySelector('form[action="/auth/logout"]');
      expect(logoutForm).not.toBeNull();
      expect(logoutForm?.getAttribute('method')).toBe('POST');

      const logoutBtn = logoutForm?.querySelector('button[type="submit"]');
      expect(logoutBtn).not.toBeNull();
      expect(logoutBtn?.getAttribute('aria-label')).toBe('Log out');
      expect(logoutBtn?.className).toContain('focus-ring');

      // Clicking a navigation link closes drawer
      const studentsLink = drawer?.querySelector('a[href="/students"]') as HTMLAnchorElement;
      await act(async () => {
        studentsLink.click();
      });

      // Drawer is closed
      const closedDrawer = document.body.querySelector('div[role="dialog"][aria-modal="true"]');
      expect(closedDrawer).toBeNull();
    });
  });
});
