'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90 active:opacity-95 shadow-sm',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-muted active:opacity-90 shadow-sm border border-border',
  outline: 'border border-input bg-transparent text-foreground hover:bg-muted hover:text-foreground active:opacity-90',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90 active:opacity-95 shadow-sm',
  ghost: 'text-foreground hover:bg-muted hover:text-foreground active:opacity-90',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

const spinnerSizes: Record<ButtonSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled = false,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading ? true : undefined}
        aria-disabled={isDisabled ? true : undefined}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-ring select-none cursor-pointer',
          'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className={cn('animate-spin shrink-0', spinnerSizes[size])} aria-hidden="true" />
            {loadingText ? (
              <span>{loadingText}</span>
            ) : (
              <>
                <span className="sr-only">Loading...</span>
                {children}
              </>
            )}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="inline-flex shrink-0 items-center" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="inline-flex shrink-0 items-center" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
