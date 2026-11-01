import BillingPageSkeleton from "@/components/loading/skeletons/BillingPageSkeleton";
import DashboardPageSkeleton from "@/components/loading/skeletons/DashboardPageSkeleton";
import DefaultPageSkeleton from "@/components/loading/skeletons/DefaultPageSkeleton";
import SchedulePageSkeleton from "@/components/loading/skeletons/SchedulePageSkeleton";
import TablePageSkeleton from "@/components/loading/skeletons/TablePageSkeleton";
import type { ComponentType } from "react";

function normalizeAdminPath(pathname: string): string {
  const trimmed = pathname.replace(/\/$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/** Matches admin segment loading.tsx skeleton choices for tutor-switch and navigation. */
export function adminRouteSkeletonForPath(pathname: string): ComponentType {
  const path = normalizeAdminPath(pathname);

  if (path === "/schedule") {
    return SchedulePageSkeleton;
  }
  if (path === "/students" || path === "/parents") {
    return TablePageSkeleton;
  }
  if (path === "/invoices" || path === "/finance" || path === "/reports") {
    return BillingPageSkeleton;
  }
  if (path === "/settings") {
    return DefaultPageSkeleton;
  }
  if (path === "/admin/users" || path === "/admin/tutors") {
    return TablePageSkeleton;
  }
  if (path === "/") {
    return DashboardPageSkeleton;
  }

  return DashboardPageSkeleton;
}

type AdminRouteSkeletonProps = {
  pathname: string;
};

export default function AdminRouteSkeleton({ pathname }: AdminRouteSkeletonProps) {
  const Skeleton = adminRouteSkeletonForPath(pathname);
  return <Skeleton />;
}
