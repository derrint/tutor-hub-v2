"use client";

import Button from "@/components/ui/button/Button";
import { useAttendance } from "@/context/AttendanceContext";
import { useTranslations } from "next-intl";

type SessionAttendanceToggleProps = {
  occurrenceId: string;
  compact?: boolean;
};

const SessionAttendanceToggle: React.FC<SessionAttendanceToggleProps> = ({
  occurrenceId,
  compact = false,
}) => {
  const t = useTranslations("tutorHub.attendance");
  const { isAbsent, toggleAbsent } = useAttendance();
  const absent = isAbsent(occurrenceId);

  return (
    <Button
      size="sm"
      variant={absent ? "outline" : "outline"}
      className={compact ? "shrink-0" : undefined}
      aria-pressed={absent}
      aria-label={absent ? t("markBillableAria") : t("markAbsentAria")}
      onClick={() => toggleAbsent(occurrenceId)}
    >
      {absent ? t("markBillable") : t("markAbsent")}
    </Button>
  );
};

export default SessionAttendanceToggle;
