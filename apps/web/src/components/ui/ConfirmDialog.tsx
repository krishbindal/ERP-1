'use client';

import * as React from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  const defaultConfirmText = isDestructive ? 'Delete' : 'Confirm';
  const effectiveConfirmText = confirmText || defaultConfirmText;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch {
      // Errors should be handled by caller
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) {
          onClose();
        }
      }}
      title={title}
      description={message}
      maxWidth="sm"
    >
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          variant={isDestructive ? 'destructive' : 'primary'}
          onClick={handleConfirm}
          isLoading={isLoading}
          loadingText="Processing..."
        >
          {effectiveConfirmText}
        </Button>
      </div>
    </Dialog>
  );
}
