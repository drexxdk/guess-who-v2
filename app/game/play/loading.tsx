import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="rounded-lg border bg-card w-full max-w-2xl mx-auto">
      <div className="p-6 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <div className="p-6 pt-0 space-y-6">
        {/* Question area */}
        <div className="text-center space-y-4">
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-48 w-48 mx-auto rounded-lg" />
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>

        {/* Timer */}
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  );
}
