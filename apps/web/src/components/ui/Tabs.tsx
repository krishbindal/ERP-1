'use client';

import * as React from 'react';
import { cn } from './utils';

interface TabsContextValue {
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
  baseId: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs subcomponents must be used within a <Tabs /> provider');
  }
  return context;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      defaultValue = '',
      value: controlledValue,
      onValueChange,
      orientation = 'horizontal',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const selectedValue = isControlled ? controlledValue : uncontrolledValue;
    const baseId = React.useId();

    const setSelectedValue = React.useCallback(
      (val: string) => {
        if (!isControlled) {
          setUncontrolledValue(val);
        }
        onValueChange?.(val);
      },
      [isControlled, onValueChange]
    );

    return (
      <TabsContext.Provider
        value={{
          selectedValue,
          setSelectedValue,
          orientation,
          baseId,
        }}
      >
        <div
          ref={ref}
          className={cn(orientation === 'vertical' ? 'flex gap-4' : 'flex flex-col gap-2', className)}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = 'Tabs';

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, onKeyDown, children, ...props }, ref) => {
    const { orientation, setSelectedValue } = useTabsContext();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      const container = e.currentTarget;
      const tabs = Array.from(
        container.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
      );
      if (tabs.length === 0) return;

      const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
      let targetIndex = -1;

      if (e.key === 'ArrowRight' || (orientation === 'vertical' && e.key === 'ArrowDown')) {
        e.preventDefault();
        targetIndex = currentIndex >= tabs.length - 1 ? 0 : currentIndex + 1;
      } else if (e.key === 'ArrowLeft' || (orientation === 'vertical' && e.key === 'ArrowUp')) {
        e.preventDefault();
        targetIndex = currentIndex <= 0 ? tabs.length - 1 : currentIndex - 1;
      } else if (e.key === 'Home') {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        targetIndex = tabs.length - 1;
      }

      if (targetIndex !== -1 && tabs[targetIndex]) {
        const targetTab = tabs[targetIndex];
        targetTab.focus();
        const tabVal = targetTab.getAttribute('data-value');
        if (tabVal) {
          setSelectedValue(tabVal);
        }
      }
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn(
          'inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground select-none',
          orientation === 'vertical' ? 'flex-col items-stretch' : 'flex-row',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, onClick, children, ...props }, ref) => {
    const { selectedValue, setSelectedValue, baseId } = useTabsContext();
    const isSelected = selectedValue === value;
    const tabId = `${baseId}-tab-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={tabId}
        data-value={value}
        aria-selected={isSelected}
        aria-controls={panelId}
        tabIndex={isSelected ? 0 : -1}
        disabled={disabled}
        onClick={(e) => {
          onClick?.(e);
          if (!disabled) {
            setSelectedValue(value);
          }
        }}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-ring cursor-pointer',
          'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
          isSelected
            ? 'bg-surface text-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-surface/50 hover:text-foreground',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { selectedValue, baseId } = useTabsContext();
    const isSelected = selectedValue === value;
    const tabId = `${baseId}-tab-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    if (!isSelected) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId}
        tabIndex={0}
        className={cn('mt-2 focus-ring rounded-lg', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';

export const Tab = TabsTrigger;
export const TabPanel = TabsContent;
