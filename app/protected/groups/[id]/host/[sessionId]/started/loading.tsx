import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6 space-y-6">
        <div className="text-center space-y-4 py-8">
          <Skeleton className="h-8 w-40 mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 mx-auto" />
            <Skeleton className="h-20 w-48 mx-auto" />
          </div>
          <Skeleton className="h-5 w-72 mx-auto" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}
