import * as React from 'react';
import { cn } from './utils';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, ...props }, ref) => (
    <div className={cn('relative w-full overflow-x-auto rounded-md border border-border bg-surface', containerClassName)}>
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm text-foreground', className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b border-border bg-muted/50', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0 divide-y divide-border', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-border transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  scope?: string;
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, scope = 'col', ...props }, ref) => (
    <th
      ref={ref}
      scope={scope}
      className={cn(
        'h-11 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wider text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle text-sm text-foreground [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export interface TableEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const TableEmpty = React.forwardRef<HTMLDivElement, TableEmptyProps>(
  ({ className, title = 'No results found', description, icon, action, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      {...props}
    >
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <h4 className="text-base font-medium text-foreground">{title}</h4>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {children}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
);
TableEmpty.displayName = 'TableEmpty';

export interface TableEmptyRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  colSpan: number;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const TableEmptyRow = React.forwardRef<HTMLTableRowElement, TableEmptyRowProps>(
  ({ colSpan, title, description, icon, action, className, ...props }, ref) => (
    <TableRow ref={ref} className="hover:bg-transparent" {...props}>
      <TableCell colSpan={colSpan} className={cn('p-0', className)}>
        <TableEmpty title={title} description={description} icon={icon} action={action} />
      </TableCell>
    </TableRow>
  )
);
TableEmptyRow.displayName = 'TableEmptyRow';
