import type { AutoFormFieldProps } from '@autoform/react';
import type React from 'react';
import { Input } from '@/components/input';

export const StringField: React.FC<AutoFormFieldProps> = ({ inputProps, error, id }) => {
  // biome-ignore lint/correctness/noUnusedVariables: part of auto form string field implementation
  const { key, ...props } = inputProps;

  return <Input id={id} className={error ? 'border-destructive' : ''} {...props} />;
};
