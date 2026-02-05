import { GroupCardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="h-9 w-32 bg-muted rounded animate-pulse" />
          <div className="h-5 w-64 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-40 bg-muted rounded animate-pulse" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <GroupCardSkeleton />
        <GroupCardSkeleton />
        <GroupCardSkeleton />
      </div>
    </>
  );
}
