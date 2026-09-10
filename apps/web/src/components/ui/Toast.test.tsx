import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach} from 'vitest';
import { Toaster, toast, clearToasts } from './Toast';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('Toaster', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => { clearToasts(); root.unmount(); });
    container.remove();
  });

  it('renders a toast when toast() is called', () => {
    act(() => {
      root.render(<Toaster position="bottom-right" />);
    });
    
    act(() => {
      toast.success('This is a success message!');
    });
    
    const bodyContent = document.body.innerHTML;
    expect(bodyContent).toContain('This is a success message!');
  });
});


