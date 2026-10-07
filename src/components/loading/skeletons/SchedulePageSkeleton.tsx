import Skeleton from "@/components/ui/skeleton/Skeleton";

/** Schedule route + FullCalendar mount placeholder. */
export default function SchedulePageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-[min(70vh,720px)] w-full rounded-2xl" />
    </div>
  );
}
