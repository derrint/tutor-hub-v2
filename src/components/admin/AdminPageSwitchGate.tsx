"use client";

import AdminRouteSkeleton from "@/components/loading/AdminRouteSkeleton";
import { useTutorSwitch } from "@/context/TutorSwitchContext";
import { usePathname } from "@/i18n/navigation";

/** Hides route content while admin tutor context is refreshing after a switch. */
export default function AdminPageSwitchGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isSwitchingTutor } = useTutorSwitch();

  if (isSwitchingTutor) {
    return <AdminRouteSkeleton pathname={pathname} />;
  }

  return children;
}
