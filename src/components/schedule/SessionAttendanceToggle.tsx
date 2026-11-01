"use client";

import Button from "@/components/ui/button/Button";
import { useAttendance } from "@/context/AttendanceContext";
import { cn } from "@/utils";
import { Loader2, RotateCcw, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

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
  const [isPending, setIsPending] = useState(false);

  const handleClick = async () => {
    if (isPending) return;
    setIsPending(true);
    await toggleAbsent(occurrenceId);
    setIsPending(false);
  };

  return (
    <Button
      size="sm"
      variant={absent ? "outlineSuccess" : "outlineWarning"}
      className={cn(compact && "shrink-0", className)}
      disabled={isPending}
      startIcon={
        isPending ? (
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
        ) : showIcon ? (
          absent ? (
            <RotateCcw className="size-4 shrink-0" aria-hidden />
          ) : (
            <UserX className="size-4 shrink-0" aria-hidden />
          )
        ) : undefined
      }
      aria-pressed={absent}
      aria-busy={isPending}
      aria-label={absent ? t("markBillableAria") : t("markAbsentAria")}
      onClick={() => void handleClick()}
    >
      {isPending
        ? t("saving")
        : absent
          ? t("markBillable")
          : t("markAbsent")}
    </Button>
  );
};

export default SessionAttendanceToggle;
