'use client';

import { motion, type Transition } from 'motion/react';
import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  type TooltipContentProps,
  type TooltipProps,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/redpanda-ui/tooltip';
import { cn } from '@/lib/utils';

type AvatarProps = TooltipProps & {
  children: React.ReactNode;
  zIndex: number;
  transition: Transition;
  translate: string | number;
};

function AvatarContainer({ children, zIndex, transition, translate, ...props }: AvatarProps) {
  return (
    <Tooltip {...props}>
      <TooltipTrigger>
        <motion.div
          data-slot="avatar-container"
          initial="initial"
          whileHover="hover"
          whileTap="hover"
          className="relative"
          style={{ zIndex }}
        >
          <motion.div
            variants={{
              initial: { y: 0 },
              hover: { y: translate },
            }}
            transition={transition}
          >
            {children}
          </motion.div>
        </motion.div>
      </TooltipTrigger>
    </Tooltip>
  );
}

type AvatarGroupTooltipProps = TooltipContentProps;

function AvatarGroupTooltip(props: AvatarGroupTooltipProps) {
  return <TooltipContent {...props} />;
}

type AvatarGroupProps = Omit<React.ComponentProps<'div'>, 'translate'> & {
  children: React.ReactElement[];
  transition?: Transition;
  invertOverlap?: boolean;
  translate?: string | number;
  tooltipProps?: Omit<TooltipContentProps, 'children'>;
};

function AvatarGroup({
  ref,
  children,
  className,
  transition = { type: 'spring', stiffness: 400, damping: 30 },
  invertOverlap = false,
  translate = '-30%',
  tooltipProps = { side: 'top', sideOffset: 24 },
  ...props
}: AvatarGroupProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div
        ref={ref}
        data-slot="avatar-group"
        className={cn('flex flex-row -space-x-2 items-center h-8', className)}
        {...props}
      >
        {children?.map((child, index) => (
          <AvatarContainer
            // biome-ignore lint/suspicious/noArrayIndexKey: part of avatar group implementation
            key={index}
            zIndex={invertOverlap ? React.Children.count(children) - index : index}
            transition={transition}
            translate={translate}
            {...tooltipProps}
          >
            {child}
          </AvatarContainer>
        ))}
      </div>
    </TooltipProvider>
  );
}

export { AvatarGroup, AvatarGroupTooltip, type AvatarGroupProps, type AvatarGroupTooltipProps };
