'use client';

import * as React from 'react';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { AlertCircle } from 'lucide-react';

interface DrawerFormProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
  error: string | null;
  children: ReactNode;
}

export function DrawerForm({ title, onClose, onSubmit, loading, error, children }: DrawerFormProps) {
  const errorId = 'drawer-form-error';

  return (
    <Drawer isOpen={true} onClose={onClose} title={title}>
      <form onSubmit={onSubmit} className="flex flex-col min-h-full justify-between">
        <div className="space-y-6 pb-6">
          {error && (
            <div
              id={errorId}
              role="alert"
              aria-live="assertive"
              className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
          {children}
        </div>
        <div className="pt-4 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-surface/95 backdrop-blur-xs py-2 mt-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            loadingText="Saving..."
          >
            Save
          </Button>
        </div>
      </form>
    </Drawer>
  );
}

