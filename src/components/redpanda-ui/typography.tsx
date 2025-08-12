import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { cn } from '@/lib/utils';

// Heading variants using cva
const headingVariants = cva('scroll-m-20 tracking-tight', {
  variants: {
    level: {
      1: 'text-4xl font-extrabold text-balance',
      2: 'border-b pb-2 text-3xl font-semibold first:mt-0',
      3: 'text-2xl font-semibold',
      4: 'text-xl font-semibold',
      5: 'text-lg font-semibold',
      6: 'text-base font-semibold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    level: 1,
    align: 'left',
  },
});

const textVariants = cva('', {
  variants: {
    variant: {
      default: 'leading-7 [&:not(:first-child)]:mt-6',
      lead: 'text-muted-foreground text-xl',
      large: 'text-lg font-semibold',
      small: 'text-sm leading-none font-medium',
      muted: 'text-muted-foreground text-sm',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    variant: 'default',
    align: 'left',
  },
});

// Main Heading Component
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  children: React.ReactNode;
  testId?: string;
}

export function Heading({ level = 1, align, className, children, testId, ...props }: HeadingProps) {
  const HeadingTag = `h${level}` as keyof React.JSX.IntrinsicElements;

  return React.createElement(
    HeadingTag,
    {
      className: cn(headingVariants({ level, align }), className),
      'data-testid': testId,
      ...props,
    },
    children,
  );
}

// Text Component
interface TextProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  children: React.ReactNode;
  as?: 'p' | 'div' | 'span' | 'small';
  testId?: string;
}

export function Text({ variant, align, as = 'p', className, children, testId, ...props }: TextProps) {
  const Component = as;

  return (
    <Component className={cn(textVariants({ variant, align }), className)} data-testid={testId} {...props}>
      {children}
    </Component>
  );
}

// Blockquote Component
interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  children: React.ReactNode;
  testId?: string;
}

export function Blockquote({ className, children, testId, ...props }: BlockquoteProps) {
  return (
    <blockquote className={cn('mt-6 border-l-2 pl-6 italic', className)} data-testid={testId} {...props}>
      {children}
    </blockquote>
  );
}

// List Component
interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  children: React.ReactNode;
  ordered?: boolean;
  testId?: string;
}

export function List({ ordered = false, className, children, testId, ...props }: ListProps) {
  const ListTag = ordered ? 'ol' : 'ul';
  const listClass = ordered ? 'my-6 ml-6 list-decimal [&>li]:mt-2' : 'my-6 ml-6 list-disc [&>li]:mt-2';

  return (
    <ListTag className={cn(listClass, className)} data-testid={testId} {...props}>
      {children}
    </ListTag>
  );
}

// List Item Component
interface ListItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  testId?: string;
}

export function ListItem({ className, children, testId, ...props }: ListItemProps) {
  return (
    <li className={className} data-testid={testId} {...props}>
      {children}
    </li>
  );
}

// Inline Code Component
interface InlineCodeProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  testId?: string;
}

export function InlineCode({ className, children, testId, ...props }: InlineCodeProps) {
  return (
    <code
      className={cn('bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold', className)}
      data-testid={testId}
      {...props}
    >
      {children}
    </code>
  );
}

// Legacy components for backward compatibility
export function TypographyH1({ children = 'Example Heading' }: { children?: React.ReactNode }) {
  return (
    <Heading level={1} align="center">
      {children}
    </Heading>
  );
}

export function TypographyH2({ children = 'Example Subheading' }: { children?: React.ReactNode }) {
  return <Heading level={2}>{children}</Heading>;
}

export function TypographyH3({ children = 'Example Section' }: { children?: React.ReactNode }) {
  return <Heading level={3}>{children}</Heading>;
}

export function TypographyH4({ children = 'Example Subsection' }: { children?: React.ReactNode }) {
  return <Heading level={4}>{children}</Heading>;
}

export function TypographyP({ children = 'Example paragraph text.' }: { children?: React.ReactNode }) {
  return <Text>{children}</Text>;
}

export function TypographyBlockquote({ children = 'Example quote text.' }: { children?: React.ReactNode }) {
  return <Blockquote>{children}</Blockquote>;
}

export function TypographyList({
  items = ['Example item 1', 'Example item 2', 'Example item 3'],
}: {
  items?: string[];
}) {
  return (
    <List>
      {items.map((item) => (
        <ListItem key={`list-item-${item}`}>{item}</ListItem>
      ))}
    </List>
  );
}

export function TypographyInlineCode({ children = 'example-code' }: { children?: React.ReactNode }) {
  return <InlineCode>{children}</InlineCode>;
}

export function TypographyLead({
  children = 'Example lead text that provides context.',
}: {
  children?: React.ReactNode;
}) {
  return <Text variant="lead">{children}</Text>;
}

export function TypographyLarge({ children = 'Example large text' }: { children?: React.ReactNode }) {
  return (
    <Text variant="large" as="div">
      {children}
    </Text>
  );
}

export function TypographySmall({ children = 'Example small text' }: { children?: React.ReactNode }) {
  return (
    <Text variant="small" as="small">
      {children}
    </Text>
  );
}

export function TypographyMuted({ children = 'Example muted text.' }: { children?: React.ReactNode }) {
  return <Text variant="muted">{children}</Text>;
}

// Table component (using existing Table component)
export function TypographyTable({
  headers = ['Header 1', 'Header 2'],
  rows = [
    ['Cell 1', 'Cell 2'],
    ['Cell 3', 'Cell 4'],
  ],
}: {
  headers?: string[];
  rows?: string[][];
}) {
  return (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full">
        <thead>
          <tr className="even:bg-muted m-0 border-t p-0">
            {headers.map((header) => (
              <th
                key={`header-${header}`}
                className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}-${row.join('-')}`} className="even:bg-muted m-0 border-t p-0">
              {row.map((cell) => (
                <td
                  key={`cell-${cell}`}
                  className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
