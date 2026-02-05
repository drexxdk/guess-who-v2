import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="rounded-lg border bg-card w-full max-w-md mx-auto">
      <div className="p-6 space-y-2">
        <Skeleton className="h-7 w-32 mx-auto" />
        <Skeleton className="h-5 w-48 mx-auto" />
      </div>
      <div className="p-6 pt-0 space-y-6">
        {/* Score */}
        <div className="text-center">
          <Skeleton className="h-16 w-24 mx-auto" />
          <Skeleton className="h-5 w-32 mx-auto mt-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>

        {/* Button */}
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
