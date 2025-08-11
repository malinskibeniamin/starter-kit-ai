'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type { Label as LabelPrimitive } from 'radix-ui';
import { Slot as SlotPrimitive } from 'radix-ui';
import * as React from 'react';
import {
  Controller,
  type ControllerProps,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  useFormState,
} from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Label } from '@/components/label';

const Form = FormProvider;

// Form layout variants for different use cases
const formVariants = cva('', {
  variants: {
    layout: {
      default: 'space-y-6',
      compact: 'space-y-4',
      loose: 'space-y-8',
      grid: 'grid gap-6',
      'grid-cols-2': 'grid grid-cols-2 gap-6',
    },
    width: {
      auto: '',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'w-full',
    },
  },
  defaultVariants: {
    layout: 'default',
    width: 'auto',
  },
});

// Form item variants for consistent spacing and layouts
const formItemVariants = cva('', {
  variants: {
    layout: {
      default: 'grid gap-2',
      horizontal: 'flex items-center gap-3',
      'horizontal-start': 'flex items-start gap-3',
      card: 'flex flex-row items-start gap-3 p-4',
      'card-horizontal': 'flex flex-row items-start justify-between p-4',
    },
    spacing: {
      none: 'gap-0',
      tight: 'gap-1',
      default: 'gap-2',
      loose: 'gap-4',
    },
  },
  defaultVariants: {
    layout: 'default',
    spacing: 'default',
  },
});

// Form section variants for grouping related fields
const formSectionVariants = cva('', {
  variants: {
    variant: {
      default: '',
      card: 'rounded-md border bg-card p-4',
      'card-elevated': 'rounded-md border bg-card p-4 shadow-sm',
      divider: 'border-t pt-6',
    },
    spacing: {
      none: '',
      default: 'space-y-4',
      loose: 'space-y-6',
    },
  },
  defaultVariants: {
    variant: 'default',
    spacing: 'default',
  },
});

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

interface FormItemProps extends React.ComponentProps<'div'>, VariantProps<typeof formItemVariants> {}

function FormItem({ className, layout, spacing, ...props }: FormItemProps) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn(formItemVariants({ layout, spacing }), className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean }) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn('data-[error=true]:text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof SlotPrimitive.Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <SlotPrimitive.Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-muted-foreground text-xs', className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : props.children;

  if (!body) {
    return null;
  }

  return (
    <p data-slot="form-message" id={formMessageId} className={cn('text-destructive text-sm', className)} {...props}>
      {body}
    </p>
  );
}

// New components for better form organization

interface FormContainerProps extends React.ComponentProps<'form'>, VariantProps<typeof formVariants> {}

function FormContainer({ className, layout, width, ...props }: FormContainerProps) {
  return <form data-slot="form-container" className={cn(formVariants({ layout, width }), className)} {...props} />;
}

interface FormSectionProps extends React.ComponentProps<'div'>, VariantProps<typeof formSectionVariants> {
  title?: string;
  description?: string;
}

function FormSection({ className, variant, spacing, title, description, children, ...props }: FormSectionProps) {
  return (
    <div data-slot="form-section" className={cn(formSectionVariants({ variant, spacing }), className)} {...props}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-medium">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

// Simplified field component that combines common patterns
interface SimpleFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, 'render'> {
  label?: string;
  description?: string;
  required?: boolean;
  layout?: FormItemProps['layout'];
  children: (field: ControllerRenderProps<TFieldValues, TName>) => React.ReactElement;
}

function SimpleFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ label, description, required, layout, children, ...props }: SimpleFormFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      {...props}
      render={({ field }) => (
        <FormItem layout={layout}>
          {label && <FormLabel required={required}>{label}</FormLabel>}
          <FormControl>{children(field)}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormContainer,
  FormSection,
  SimpleFormField,
};
