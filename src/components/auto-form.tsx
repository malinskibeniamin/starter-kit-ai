import type { ExtendableAutoFormProps } from '@autoform/react';
import { type AutoFormUIComponents, AutoForm as BaseAutoForm, buildZodFieldConfig } from '@autoform/react';
import React from 'react';

import type { FieldValues } from 'react-hook-form';

import { ArrayElementWrapper } from '@/components/auto-form-array-element-wrapper';
import { ArrayWrapper } from '@/components/auto-form-array-wrapper';
import { BooleanField } from '@/components/auto-form-boolean-field';
import { DateField } from '@/components/auto-form-date-field';
import { ErrorMessage } from '@/components/auto-form-error-message';
import { FieldWrapper } from '@/components/auto-form-field-wrapper';
import { NumberField } from '@/components/auto-form-number-field';
import { ObjectWrapper } from '@/components/auto-form-object-wrapper';
import { SelectField } from '@/components/auto-form-select-field';
import { StringField } from '@/components/auto-form-string-field';
import { SubmitButton } from '@/components/auto-form-submit-button';

export interface AutoFormProps<T extends FieldValues> extends ExtendableAutoFormProps<T> {}

export const Form = React.forwardRef<HTMLFormElement, React.ComponentProps<'form'>>(({ children, ...props }, ref) => {
  return (
    <form ref={ref} className="space-y-4" {...props}>
      {children}
    </form>
  );
});

const ShadcnUIComponents: AutoFormUIComponents = {
  Form,
  FieldWrapper,
  ErrorMessage,
  SubmitButton,
  ObjectWrapper,
  ArrayWrapper,
  ArrayElementWrapper,
};

export const ShadcnAutoFormFieldComponents = {
  string: StringField,
  number: NumberField,
  boolean: BooleanField,
  date: DateField,
  select: SelectField,
} as const;
export type FieldTypes = keyof typeof ShadcnAutoFormFieldComponents;

export const fieldConfig = buildZodFieldConfig<
  FieldTypes,
  // biome-ignore lint/complexity/noBannedTypes: part of auto-form implementation
  {
    // Add types for `customData` here.
  }
>();

export function AutoForm<T extends Record<string, unknown>>({
  uiComponents,
  formComponents,
  ...props
}: AutoFormProps<T>) {
  return (
    <BaseAutoForm
      {...props}
      uiComponents={{ ...ShadcnUIComponents, ...uiComponents }}
      formComponents={{ ...ShadcnAutoFormFieldComponents, ...formComponents }}
    />
  );
}
