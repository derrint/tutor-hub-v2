"use client";

import DefaultPageSkeleton from "@/components/loading/skeletons/DefaultPageSkeleton";
import { useTutorSwitch } from "@/context/TutorSwitchContext";

/** Hides route content while admin tutor context is refreshing after a switch. */
export default function AdminPageSwitchGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSwitchingTutor } = useTutorSwitch();

  if (isSwitchingTutor) {
    return <DefaultPageSkeleton />;
  }

  return children;
}
