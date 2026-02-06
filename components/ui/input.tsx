import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-lg border-2 border-input bg-card/50 px-4 py-2.5 text-base min-h-[44px] shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary focus-visible:shadow-lg focus-visible:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary/50 hover:shadow-md touch-manipulation",
          className,
        )}
        ref={ref}
        aria-invalid={props["aria-invalid"]}
        aria-describedby={props["aria-describedby"]}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
