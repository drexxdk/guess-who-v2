import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'border-input bg-card/50 file:text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary hover:border-primary/50 flex min-h-11 w-full touch-manipulation rounded-lg border-2 px-4 py-2.5 text-base shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:shadow-md focus-visible:scale-[1.01] focus-visible:shadow-lg focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        aria-invalid={props['aria-invalid']}
        aria-describedby={props['aria-describedby']}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
