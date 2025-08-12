'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const CreateLayoutContext = React.createContext<{
  showSummary?: boolean;
}>({
  showSummary: true,
});

interface CreateLayoutProps extends React.HTMLAttributes<HTMLDivElement> {}

const CreateLayout = React.forwardRef<HTMLDivElement, CreateLayoutProps>(({ className, ...props }, ref) => {
  return (
    <CreateLayoutContext.Provider value={{ showSummary: true }}>
      <div ref={ref} className={cn('flex min-h-screen w-full flex-col lg:flex-row', className)} {...props} />
    </CreateLayoutContext.Provider>
  );
});
CreateLayout.displayName = 'CreateLayout';

interface CreateLayoutHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const CreateLayoutHeader = React.forwardRef<HTMLDivElement, CreateLayoutHeaderProps>(
  ({ className, title, description, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-start sm:justify-between',
          className,
        )}
        {...props}
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    );
  },
);
CreateLayoutHeader.displayName = 'CreateLayoutHeader';

interface CreateLayoutContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CreateLayoutContent = React.forwardRef<HTMLDivElement, CreateLayoutContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex min-h-0 flex-1 flex-col', className)} {...props}>
        {children}
      </div>
    );
  },
);
CreateLayoutContent.displayName = 'CreateLayoutContent';

interface CreateLayoutSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

const CreateLayoutSummary = React.forwardRef<HTMLDivElement, CreateLayoutSummaryProps>(
  ({ className, title = 'Summary', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('hidden w-80 shrink-0 border-l border-border bg-muted/30 lg:block', className)}
        {...props}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <div className="mt-4 space-y-4">{children}</div>
        </div>
      </div>
    );
  },
);
CreateLayoutSummary.displayName = 'CreateLayoutSummary';

interface CreateLayoutFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CreateLayoutFooter = React.forwardRef<HTMLDivElement, CreateLayoutFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('border-t border-border bg-background p-6', className)} {...props}>
        {children}
      </div>
    );
  },
);
CreateLayoutFooter.displayName = 'CreateLayoutFooter';

interface CreateLayoutActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CreateLayoutActions = React.forwardRef<HTMLDivElement, CreateLayoutActionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
        {children}
      </div>
    );
  },
);
CreateLayoutActions.displayName = 'CreateLayoutActions';

interface CreateLayoutSummaryItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
}

const CreateLayoutSummaryItem = React.forwardRef<HTMLDivElement, CreateLayoutSummaryItemProps>(
  ({ className, label, value, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex justify-between', className)} {...props}>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-sm text-muted-foreground truncate max-w-[50%] font-mono" title={value}>
          {value}
        </div>
      </div>
    );
  },
);
CreateLayoutSummaryItem.displayName = 'CreateLayoutSummaryItem';

export {
  CreateLayout,
  CreateLayoutHeader,
  CreateLayoutContent,
  CreateLayoutSummary,
  CreateLayoutSummaryItem,
  CreateLayoutFooter,
  CreateLayoutActions,
};
