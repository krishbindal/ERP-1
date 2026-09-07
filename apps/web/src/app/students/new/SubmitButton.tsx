'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui';
import { Loader2 } from 'lucide-react';

export function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button
      id="enroll-submit-btn"
      type="submit"
      variant="primary"
      className="relative w-full sm:w-auto min-h-[44px] sm:min-h-0"
      disabled={pending}
      aria-busy={pending}
    >
      {pending && (
        <Loader2
          className="submit-spinner mr-2 h-4 w-4 animate-spin shrink-0"
          aria-hidden="true"
        />
      )}
      <span className="submit-text">{pending ? 'Enrolling...' : 'Create & Enroll'}</span>
    </Button>
  );
}
