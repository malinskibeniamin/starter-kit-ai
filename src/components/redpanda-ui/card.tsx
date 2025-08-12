import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-lg min-w-0 border border-solid bg-white border-base-200 flex flex-col shadow-shadow-elevated dark:bg-base-900 dark:border-base-800',
  {
    variants: {
      size: {
        sm: 'px-12 py-8 gap-4 max-w-sm',
        md: 'px-16 py-12 gap-5 max-w-md',
        lg: 'px-20 py-16 gap-6 max-w-lg',
        xl: 'px-24 py-20 gap-8 max-w-xl',
        full: 'px-16 py-12 gap-5 w-full',
      },
      variant: {
        default: '',
        elevated: 'shadow-lg',
        outlined: 'border-2',
        ghost: 'border-0 shadow-none bg-transparent dark:bg-transparent',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
);

interface CardProps extends React.ComponentProps<'div'>, VariantProps<typeof cardVariants> {
  testId?: string;
}

function Card({ className, size, variant, testId, ...props }: CardProps) {
  return (
    <div data-slot="card" data-testid={testId} className={cn(cardVariants({ size, variant }), className)} {...props} />
  );
}

const cardHeaderVariants = cva(
  '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
  {
    variants: {
      spacing: {
        tight: 'gap-1',
        normal: 'gap-1.5',
        loose: 'gap-2',
      },
      padding: {
        none: '',
        sm: 'px-3',
        md: 'px-6',
        lg: 'px-8',
      },
    },
    defaultVariants: {
      spacing: 'normal',
      padding: 'none',
    },
  },
);

interface CardHeaderProps extends React.ComponentProps<'div'>, VariantProps<typeof cardHeaderVariants> {
  testId?: string;
}

function CardHeader({ className, spacing, padding, testId, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      data-testid={testId}
      className={cn(cardHeaderVariants({ spacing, padding }), className)}
      {...props}
    />
  );
}

function CardTitle({ className, testId, ...props }: React.ComponentProps<'div'> & { testId?: string }) {
  return (
    <div
      data-slot="card-title"
      data-testid={testId}
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  );
}

function CardDescription({ className, testId, ...props }: React.ComponentProps<'div'> & { testId?: string }) {
  return (
    <div
      data-slot="card-description"
      data-testid={testId}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function CardAction({ className, testId, ...props }: React.ComponentProps<'div'> & { testId?: string }) {
  return (
    <div
      data-slot="card-action"
      data-testid={testId}
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  );
}

const cardContentVariants = cva('', {
  variants: {
    padding: {
      none: '',
      sm: 'px-3',
      md: 'px-6',
      lg: 'px-8',
    },
    space: {
      none: '',
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6',
    },
  },
  defaultVariants: {
    padding: 'none',
    space: 'md',
  },
});

interface CardContentProps extends React.ComponentProps<'div'>, VariantProps<typeof cardContentVariants> {
  testId?: string;
}

function CardContent({ className, padding, space, testId, ...props }: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      data-testid={testId}
      className={cn(cardContentVariants({ padding, space }), className)}
      {...props}
    />
  );
}

const cardFooterVariants = cva('flex items-center [.border-t]:pt-6', {
  variants: {
    direction: {
      row: 'flex-row',
      column: 'flex-col',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    },
    gap: {
      none: '',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    },
    padding: {
      none: '',
      sm: 'px-3',
      md: 'px-6',
      lg: 'px-8',
    },
  },
  defaultVariants: {
    direction: 'row',
    justify: 'between',
    gap: 'sm',
    padding: 'none',
  },
});

interface CardFooterProps extends React.ComponentProps<'div'>, VariantProps<typeof cardFooterVariants> {
  testId?: string;
}

function CardFooter({ className, direction, justify, gap, padding, testId, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      data-testid={testId}
      className={cn(cardFooterVariants({ direction, justify, gap, padding }), className)}
      {...props}
    />
  );
}

// Form-specific layout helpers
const cardFormVariants = cva('grid w-full items-center', {
  variants: {
    gap: {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    },
  },
  defaultVariants: {
    gap: 'md',
  },
});

interface CardFormProps extends React.ComponentProps<'div'>, VariantProps<typeof cardFormVariants> {
  testId?: string;
}

function CardForm({ className, gap, testId, ...props }: CardFormProps) {
  return <div data-testid={testId} className={cn(cardFormVariants({ gap }), className)} {...props} />;
}

const cardFieldVariants = cva('flex flex-col', {
  variants: {
    spacing: {
      tight: 'space-y-1',
      normal: 'space-y-1.5',
      loose: 'space-y-2',
    },
  },
  defaultVariants: {
    spacing: 'normal',
  },
});

interface CardFieldProps extends React.ComponentProps<'div'>, VariantProps<typeof cardFieldVariants> {
  testId?: string;
}

function CardField({ className, spacing, testId, ...props }: CardFieldProps) {
  return <div data-testid={testId} className={cn(cardFieldVariants({ spacing }), className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, CardForm, CardField };
