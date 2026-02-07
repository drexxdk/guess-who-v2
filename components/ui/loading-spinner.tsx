import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin rounded-full border-t-transparent', {
  variants: {
    size: {
      sm: 'w-8 h-8 border-2',
      md: 'w-12 h-12 border-3',
      lg: 'w-16 h-16 border-4',
    },
    color: {
      white: 'border-white',
      primary: 'border-primary',
      accent: 'border-accent',
      muted: 'border-muted-foreground',
    },
  },
  defaultVariants: {
    size: 'lg',
    color: 'white',
  },
});

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export function LoadingSpinner({ className, size, color }: LoadingSpinnerProps) {
  return <div className={cn(spinnerVariants({ size, color }), className)} />;
}

export function LoadingOverlay({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="top-header fixed right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-black/50">
      <LoadingSpinner size={size} color="white" />
    </div>
  );
}

export { spinnerVariants };
