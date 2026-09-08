import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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
        Info: () => <svg data-testid="icon-info" />,
    X: () => <svg data-testid="icon-x" />,
    AlertCircle: createMockIcon('alert-circle'),
    Loader2: createMockIcon('loader2'),
  };
});

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { Input, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

// Isolated component mirror of the enrollment form layout in NewStudentPage
function StudentEnrollmentFormView({
  errorMessage,
  onSubmit,
}: {
  errorMessage?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="p-8 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Enroll New Student</CardTitle>
          <CardDescription>Enter student details to register and assign a branch placement.</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm font-medium text-destructive flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold">Enrollment Failed</p>
                <p className="mt-1 text-sm text-destructive/90">{errorMessage}</p>
              </div>
            </div>
          )}

          <form id="enroll-student-form" onSubmit={onSubmit} className="space-y-5">
            <Input
              id="firstName"
              name="firstName"
              label="First Name"
              required
              placeholder="e.g. John"
              aria-invalid={errorMessage ? true : undefined}
            />
            <Input
              id="lastName"
              name="lastName"
              label="Last Name"
              required
              placeholder="e.g. Doe"
              aria-invalid={errorMessage ? true : undefined}
            />
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              label="Date of Birth"
              placeholder="YYYY-MM-DD"
              aria-invalid={errorMessage ? true : undefined}
            />
            <div className="pt-4 flex justify-end items-center gap-3">
              <Button id="enroll-submit-btn" type="submit" variant="primary">
                Create &amp; Enroll
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

describe('StudentEnrollmentFormView component', () => {
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

  it('renders student enrollment form with required inputs and explicit labels', async () => {
    await act(async () => {
      root.render(<StudentEnrollmentFormView />);
    });

    expect(container.textContent).toContain('Enroll New Student');
    expect(container.textContent).toContain('Enter student details to register and assign a branch placement.');

    const firstInput = container.querySelector('#firstName') as HTMLInputElement;
    const lastInput = container.querySelector('#lastName') as HTMLInputElement;
    const dobInput = container.querySelector('#dateOfBirth') as HTMLInputElement;

    expect(firstInput).not.toBeNull();
    expect(lastInput).not.toBeNull();
    expect(dobInput).not.toBeNull();

    expect(firstInput.getAttribute('required')).not.toBeNull();
    expect(lastInput.getAttribute('required')).not.toBeNull();

    // Verify htmlFor associations
    const labels = container.querySelectorAll('label');
    const labelForValues = Array.from(labels).map((l) => l.getAttribute('for'));
    expect(labelForValues).toContain('firstName');
    expect(labelForValues).toContain('lastName');
    expect(labelForValues).toContain('dateOfBirth');
  });

  it('renders accessible alert role and live region when errorMessage is provided', async () => {
    const error = 'First name and last name are required.';
    await act(async () => {
      root.render(<StudentEnrollmentFormView errorMessage={error} />);
    });

    const alert = container.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert?.getAttribute('aria-live')).toBe('assertive');
    expect(alert?.textContent).toContain('Enrollment Failed');
    expect(alert?.textContent).toContain(error);

    const firstInput = container.querySelector('#firstName');
    expect(firstInput?.getAttribute('aria-invalid')).toBe('true');
  });

  it('handles form submission trigger correctly', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    await act(async () => {
      root.render(<StudentEnrollmentFormView onSubmit={onSubmit} />);
    });

    const form = container.querySelector('form');
    expect(form).not.toBeNull();

    await act(async () => {
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(onSubmit).toHaveBeenCalled();
  });
});

