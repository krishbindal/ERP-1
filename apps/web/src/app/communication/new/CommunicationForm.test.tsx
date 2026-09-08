import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CommunicationForm } from './CommunicationForm';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

vi.mock('@/components/ui', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    toast: { error: vi.fn(), success: vi.fn() }
  };
});

describe('CommunicationForm', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => { root.unmount(); });
    container.remove();
  });

  const mockTargets = [
    { target_type: 'BRANCH', target_id: '', target_name: 'Branch' },
    { target_type: 'CLASS', target_id: 'c1', target_name: 'Class 1' }
  ];

  it('BRANCH type does not require target_id', async () => {
    const createAction = vi.fn().mockResolvedValue({ success: true });
    act(() => {
      root.render(<CommunicationForm targets={mockTargets} createAction={createAction as never} />);
    });
    
    const form = document.querySelector('form');
    await act(async () => {
      form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    
    expect(createAction).toHaveBeenCalled();
  });

  it('empty target_id validation error is rendered', async () => {
    // If validation fails (or if mock returns the validation error), it should render the required state
    const createAction = vi.fn().mockResolvedValue({ error: 'Please select a specific class or section.' });
    act(() => {
      root.render(<CommunicationForm targets={mockTargets} createAction={createAction as never} />);
    });
    
    const form = document.querySelector('form');
    await act(async () => {
      form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    
    expect(document.body.innerHTML).toContain('Please select a specific class or section.');
  });
});

