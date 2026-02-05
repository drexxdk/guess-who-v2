import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string | null | undefined;
  className?: string;
  size?: "sm" | "md" | "lg";
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
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "bg-red-100 text-red-700 rounded-lg",
        sizeClasses[size],
        className,
      )}
    >
      {message}
    </div>
  );
}
