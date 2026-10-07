import Skeleton from "@/components/ui/skeleton/Skeleton";

/** Covers the schedule time grid while FullCalendar initializes. */
export default function ScheduleCalendarMountSkeleton() {
  return <Skeleton className="h-[min(70vh,720px)] w-full rounded-2xl" />;
}
