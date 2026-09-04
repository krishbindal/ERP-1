'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      helperText,
      options,
      placeholder,
      children,
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
          <select
            ref={ref}
            id={id}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : props['aria-invalid']}
            aria-describedby={ariaDescribedBy}
            className={cn(
              'w-full appearance-none rounded-lg border bg-surface px-3 py-2 pr-9 text-sm text-foreground transition-colors focus-ring',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
              error ? 'border-destructive focus:border-destructive' : 'border-input hover:border-muted-foreground/50',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="pointer-events-none absolute right-3 flex items-center text-muted-foreground" aria-hidden="true">
            <ChevronDown className="h-4 w-4" />
          </div>
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

Select.displayName = 'Select';
