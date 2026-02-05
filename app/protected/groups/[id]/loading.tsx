import { Skeleton, PersonCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* People Section */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 pb-2">
          <Skeleton className="h-7 w-24 mb-1" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="p-6 pt-2 space-y-4">
          <PersonCardSkeleton />
          <PersonCardSkeleton />
          <PersonCardSkeleton />
        </div>
      </div>

      {/* Settings Section */}
      <div className="space-y-6">
        <CardSkeleton />
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-6 w-12" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
