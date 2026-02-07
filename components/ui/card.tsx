import * as React from 'react';

import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, glass = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'border-border/50 bg-gradient-card text-card-foreground relative flex flex-col gap-4 rounded-xl border p-6 shadow-lg transition-all duration-30',
        hover && 'hover:border-primary/30 cursor-pointer hover:scale-[1.02] hover:shadow-2xl',
        glass && 'bg-card/70 backdrop-blur-md',
        !glass && 'backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props} />,
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-2xl leading-tight font-bold tracking-tight', className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-muted-foreground text-sm leading-relaxed', className)} {...props} />
  ),
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn(className)} {...props} />,
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center', className)} {...props} />,
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
