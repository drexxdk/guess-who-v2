import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg";
  suggestion?: string;
}

const sizeClasses = {
  sm: "p-2 text-xs",
  md: "p-3 text-sm",
  lg: "p-4 text-base",
};

export function ErrorMessage({
  message,
  className,
  size = "md",
  suggestion,
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-3",
        sizeClasses[size],
        className,
      )}
      role="alert"
    >
      <svg
        className="w-5 h-5 flex-shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {suggestion && (
          <p className="mt-1 text-xs opacity-80">{suggestion}</p>
        )}
      </div>
    </div>
  );
}
