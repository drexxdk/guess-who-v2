import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const messageVariants = cva(
  'flex items-start gap-3 rounded-lg border transition-all duration-200',
  {
    variants: {
      severity: {
        error: 'bg-destructive/10 border-destructive/20 text-destructive',
        warning: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400',
        success: 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400',
      },
      size: {
        sm: 'p-2 text-xs',
        md: 'p-3 text-sm',
        lg: 'p-4 text-base',
      },
    },
    defaultVariants: {
      severity: 'error',
      size: 'md',
    },
  },
);

interface ErrorMessageProps extends VariantProps<typeof messageVariants> {
  message: string | null | undefined;
  className?: string;
  suggestion?: string;
}

const iconPaths = {
  error: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z',
  warning: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
  info: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
  success: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
};

export function ErrorMessage({ message, className, size, severity, suggestion }: ErrorMessageProps) {
  if (!message) return null;

  const iconPath = iconPaths[severity || 'error'];

  return (
    <div className={cn(messageVariants({ severity, size }), className)} role="alert">
      <svg className="mt-0.5 h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d={iconPath} clipRule="evenodd" />
      </svg>
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {suggestion && <p className="mt-1 text-xs opacity-80">{suggestion}</p>}
      </div>
    </div>
  );
}

export { messageVariants };
