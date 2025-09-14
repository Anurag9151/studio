'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const SegmentedControlContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({
  value: '',
  onValueChange: () => {},
});

const segmentedControlVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-muted p-1 text-muted-foreground',
  {
    variants: {
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const SegmentedControl = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> &
    VariantProps<typeof segmentedControlVariants> & {
      value: string;
      onValueChange: (value: string) => void;
    }
>(({ className, size, value, onValueChange, ...props }, ref) => (
  <SegmentedControlContext.Provider value={{ value, onValueChange }}>
    <div
      ref={ref}
      className={cn(segmentedControlVariants({ size, className }))}
      {...props}
    />
  </SegmentedControlContext.Provider>
));
SegmentedControl.displayName = 'SegmentedControl';

const segmentedControlItemVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      checked: {
        true: 'bg-background text-foreground shadow-sm',
      },
    },
  }
);

const SegmentedControlItem = React.forwardRef<
  React.ElementRef<'button'>,
  React.ComponentPropsWithoutRef<'button'> & {
    value: string;
  }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(SegmentedControlContext);
  const checked = context.value === value;

  return (
    <button
      ref={ref}
      className={cn(segmentedControlItemVariants({ checked, className }))}
      onClick={() => context.onValueChange(value)}
      {...props}
    />
  );
});
SegmentedControlItem.displayName = 'SegmentedControlItem';

export { SegmentedControl, SegmentedControlItem };
