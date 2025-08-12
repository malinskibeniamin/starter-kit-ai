'use client';

import { OTPInput, OTPInputContext } from 'input-otp';
import { MinusIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function InputOTP({
  className,
  containerClassName,
  testId,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
  testId?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      data-testid={testId}
      containerClassName={cn('flex items-center gap-2 has-disabled:opacity-50', containerClassName)}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, testId, ...props }: React.ComponentProps<'div'> & { testId?: string }) {
  return (
    <div data-slot="input-otp-group" data-testid={testId} className={cn('flex items-center', className)} {...props} />
  );
}

function InputOTPSlot({
  index,
  className,
  testId,
  ...props
}: React.ComponentProps<'div'> & {
  index: number;
  testId?: string;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-testid={testId}
      data-active={isActive}
      className={cn(
        'data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ testId, ...props }: React.ComponentProps<'div'> & { testId?: string }) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: part of input-otp implementation
    // biome-ignore lint/a11y/useFocusableInteractive: part of input-otp implementation
    // biome-ignore lint/a11y/useAriaPropsForRole: part of input-otp implementation
    <div data-slot="input-otp-separator" data-testid={testId} role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
