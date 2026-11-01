import AdminRouteSkeleton from "@/components/loading/AdminRouteSkeleton";

/** Default admin route loading (dashboard + generic segments without their own `loading.tsx`). */
export default function AdminRouteLoading() {
  return <AdminRouteSkeleton pathname="/" />;
}
