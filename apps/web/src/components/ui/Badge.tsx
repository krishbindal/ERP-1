import * as React from 'react';
import { cn } from './utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground border-border',
  success: 'bg-success text-success-foreground border-transparent',
  warning: 'bg-warning text-warning-foreground border-transparent',
  destructive: 'bg-destructive text-destructive-foreground border-transparent',
  outline: 'bg-transparent text-foreground border-border',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors select-none',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
