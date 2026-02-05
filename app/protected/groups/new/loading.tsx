import { Skeleton, FormSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="p-6 pt-0">
        <FormSkeleton />
      </div>
    </div>
  );
}
