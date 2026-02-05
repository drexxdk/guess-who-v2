import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="rounded-lg border bg-card w-full max-w-md mx-auto">
      <div className="p-6 space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="p-6 pt-0 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
