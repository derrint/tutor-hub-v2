import Skeleton from "@/components/ui/skeleton/Skeleton";

type BillingPageSkeletonProps = {
  /** Set false when the route already rendered `PageHeader`. */
  includeHeader?: boolean;
};

/** Invoices, finance, reports — month navigator + cards. */
export default function BillingPageSkeleton({
  includeHeader = true,
}: BillingPageSkeletonProps) {
  return (
    <div className="space-y-6">
      {includeHeader ? (
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="size-10 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="size-10 rounded-lg" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
