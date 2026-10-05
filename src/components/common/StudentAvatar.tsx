import type { EducationLevel } from "@/lib/mock-data";
import {
  STUDENT_AVATAR_COLOR_CLASSES,
  resolveStudentCalendarColorKey,
  type StudentCalendarColorKey,
} from "@/lib/students/calendar-colors";
import { cn } from "@/utils";
import React from "react";

const LEVEL_STYLES: Record<EducationLevel, string> = {
  TK: "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
  SD: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
};

interface StudentAvatarProps {
  name: string;
  level: EducationLevel;
  studentId?: string;
  calendarColorKey?: StudentCalendarColorKey;
  className?: string;
}

const StudentAvatar: React.FC<StudentAvatarProps> = ({
  name,
  level,
  studentId,
  calendarColorKey,
  className,
}) => {
  const colorKey =
    calendarColorKey ??
    (studentId
      ? resolveStudentCalendarColorKey(undefined, studentId)
      : undefined);

  const colorClass =
    colorKey != null
      ? STUDENT_AVATAR_COLOR_CLASSES[colorKey]
      : LEVEL_STYLES[level];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-theme-sm font-semibold",
        colorClass,
        className,
      )}
    >
      {name.slice(0, 1)}
    </span>
  );
};

export default StudentAvatar;
