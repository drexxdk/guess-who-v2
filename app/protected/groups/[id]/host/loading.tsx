import { Skeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6 space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="p-6 pt-0 space-y-6">
        {/* Game Mode Selection */}
        <div>
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>

        {/* Settings Sliders */}
        <div className="space-y-4">
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-2 w-full" />
          </div>
          <div>
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-2 w-full" />
          </div>
          <div>
            <Skeleton className="h-5 w-36 mb-2" />
            <Skeleton className="h-2 w-full" />
          </div>
        </div>

        {/* Start Button */}
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
