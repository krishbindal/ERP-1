'use client';

import * as React from 'react';
import { cn } from './utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      leftAddon,
      rightAddon,
      id: customId,
      required,
      disabled,
      'aria-describedby': customAriaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const id = customId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const describedByParts: string[] = [];
    if (customAriaDescribedBy) describedByParts.push(customAriaDescribedBy);
    if (error) describedByParts.push(errorId);
    if (helperText) describedByParts.push(helperId);
    const ariaDescribedBy = describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
            {required && (
              <span className="text-destructive ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground" aria-hidden="true">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : props['aria-invalid']}
            aria-describedby={ariaDescribedBy}
            className={cn(
              'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-ring',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
              error ? 'border-destructive focus:border-destructive' : 'border-input hover:border-muted-foreground/50',
              leftAddon ? 'pl-9' : undefined,
              rightAddon ? 'pr-9' : undefined,
              className
            )}
            {...props}
          />
          {rightAddon && (
            <div className="pointer-events-none absolute right-3 flex items-center text-muted-foreground" aria-hidden="true">
              {rightAddon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-destructive font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="mt-1.5 text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
