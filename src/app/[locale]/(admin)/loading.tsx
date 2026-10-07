import DashboardPageSkeleton from "@/components/loading/skeletons/DashboardPageSkeleton";

/** Default admin route loading (dashboard + generic segments without their own `loading.tsx`). */
export default function AdminRouteLoading() {
  return <DashboardPageSkeleton />;
}
