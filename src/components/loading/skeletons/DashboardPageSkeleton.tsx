import Skeleton from "@/components/ui/skeleton/Skeleton";

export default function DashboardPageSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
