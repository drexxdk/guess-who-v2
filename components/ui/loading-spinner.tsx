import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 border-2',
  md: 'w-12 h-12 border-3',
  lg: 'w-16 h-16 border-4',
};

export function LoadingSpinner({ className, size = 'lg' }: LoadingSpinnerProps) {
  return (
    <div className={cn('animate-spin rounded-full border-white border-t-transparent', sizeClasses[size], className)} />
  );
}

export function LoadingOverlay({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="top-header fixed right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-black/50">
      <LoadingSpinner size={size} />
    </div>
  );
}
