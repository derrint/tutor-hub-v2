"use client";

import Button from "@/components/ui/button/Button";
import { useAttendance } from "@/context/AttendanceContext";
import { cn } from "@/utils";
import { RotateCcw, UserX } from "lucide-react";
import { useTranslations } from "next-intl";

type SessionAttendanceToggleProps = {
  occurrenceId: string;
  compact?: boolean;
  className?: string;
  showIcon?: boolean;
};

const SessionAttendanceToggle: React.FC<SessionAttendanceToggleProps> = ({
  occurrenceId,
  compact = false,
  className,
  showIcon = false,
}) => {
  const t = useTranslations("tutorHub.attendance");
  const { isAbsent, toggleAbsent } = useAttendance();
  const absent = isAbsent(occurrenceId);

  return (
    <Button
      size="sm"
      variant={absent ? "outlineSuccess" : "outlineWarning"}
      className={cn(compact && "shrink-0", className)}
      startIcon={
        showIcon ? (
          absent ? (
            <RotateCcw className="size-4 shrink-0" aria-hidden />
          ) : (
            <UserX className="size-4 shrink-0" aria-hidden />
          )
        ) : undefined
      }
      aria-pressed={absent}
      aria-label={absent ? t("markBillableAria") : t("markAbsentAria")}
      onClick={() => toggleAbsent(occurrenceId)}
    >
      {absent ? t("markBillable") : t("markAbsent")}
    </Button>
  );
};

export default SessionAttendanceToggle;
