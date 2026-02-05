import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function GroupCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card hover:shadow-lg transition-shadow">
      <div className="p-6 space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="p-6 pt-0 space-y-4">
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}

export function PersonCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-center gap-4">
      <Skeleton className="w-16 h-16 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-8 w-8" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div className="p-6 pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function PlayerListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 bg-muted rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-3 h-3 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
