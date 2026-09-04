'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn, useMounted } from './utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

type ToastListener = () => void;

let toasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ToastItem[] {
  return toasts;
}

const emptyToasts: ToastItem[] = [];
function getServerSnapshot(): ToastItem[] {
  return emptyToasts;
}

function addToast(message: string, type: ToastType = 'info', duration = 5000): string {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastItem = { id, message, type, duration };
  toasts = [...toasts, newToast];
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }

  return id;
}

function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

export const toast = {
  success: (message: string, duration = 5000) => addToast(message, 'success', duration),
  error: (message: string, duration = 5000) => addToast(message, 'error', duration),
  warning: (message: string, duration = 5000) => addToast(message, 'warning', duration),
  info: (message: string, duration = 5000) => addToast(message, 'info', duration),
  dismiss: (id: string) => dismissToast(id),
};

const toastIconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-success shrink-0" aria-hidden="true" />,
  error: <AlertCircle className="h-5 w-5 text-destructive shrink-0" aria-hidden="true" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning shrink-0" aria-hidden="true" />,
  info: <Info className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />,
};

const toastBorderMap: Record<ToastType, string> = {
  success: 'border-l-4 border-l-success',
  error: 'border-l-4 border-l-destructive',
  warning: 'border-l-4 border-l-warning',
  info: 'border-l-4 border-l-primary',
};

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ toast: item, onDismiss }: ToastProps) {
  const isAlert = item.type === 'error' || item.type === 'warning';

  return (
    <div
      role={isAlert ? 'alert' : 'status'}
      aria-live={isAlert ? 'assertive' : 'polite'}
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border bg-surface p-4 text-surface-foreground shadow-lg transition-all animate-in slide-in-from-bottom-2',
        toastBorderMap[item.type]
      )}
    >
      {toastIconMap[item.type]}
      <div className="flex-1 text-sm font-medium leading-5 text-foreground">{item.message}</div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-ring transition-colors cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export interface ToastProviderProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const positionClasses = {
  'top-right': 'top-4 right-4 items-end',
  'top-left': 'top-4 left-4 items-start',
  'bottom-right': 'bottom-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
};

export function ToastProvider({ position = 'bottom-right' }: ToastProviderProps) {
  const activeToasts = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mounted = useMounted();

  if (!mounted || activeToasts.length === 0) {
    return null;
  }

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cn(
        'pointer-events-none fixed z-50 flex flex-col gap-2 p-4 max-w-md w-full',
        positionClasses[position]
      )}
    >
      {activeToasts.map((item) => (
        <Toast key={item.id} toast={item} onDismiss={dismissToast} />
      ))}
    </div>,
    document.body
  );
}

export const Toaster = ToastProvider;
