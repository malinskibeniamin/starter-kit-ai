import type { AutoFormFieldProps } from '@autoform/react';
import type React from 'react';
import { Input } from '@/components/input';

export const NumberField: React.FC<AutoFormFieldProps> = ({ inputProps, error, id }) => {
  // biome-ignore lint/correctness/noUnusedVariables: part of auto form number field implementation
  const { key, ...props } = inputProps;

  return <Input id={id} type="number" className={error ? 'border-destructive' : ''} {...props} />;
};
