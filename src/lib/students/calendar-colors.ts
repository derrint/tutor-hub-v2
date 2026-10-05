/** Keys stored on `Student.calendarColorKey` and passed to FullCalendar as `extendedProps.calendar`. */
export const STUDENT_CALENDAR_COLOR_KEYS = [
  "primary",
  "success",
  "info",
  "warning",
  "danger",
  "purple",
  "pink",
] as const;

export type StudentCalendarColorKey = (typeof STUDENT_CALENDAR_COLOR_KEYS)[number];

export function isStudentCalendarColorKey(
  value: unknown,
): value is StudentCalendarColorKey {
  return (
    typeof value === "string" &&
    (STUDENT_CALENDAR_COLOR_KEYS as readonly string[]).includes(value)
  );
}

/** Stable fallback when migrating records that lack `calendarColorKey`. */
export function calendarColorKeyFromStudentId(
  studentId: string,
): StudentCalendarColorKey {
  let hash = 0;
  for (let i = 0; i < studentId.length; i += 1) {
    hash = (hash * 31 + studentId.charCodeAt(i)) >>> 0;
  }
  return STUDENT_CALENDAR_COLOR_KEYS[hash % STUDENT_CALENDAR_COLOR_KEYS.length];
}

export function pickNextStudentCalendarColorKey(
  usedKeys: Iterable<StudentCalendarColorKey>,
): StudentCalendarColorKey {
  const used = new Set(usedKeys);
  for (const key of STUDENT_CALENDAR_COLOR_KEYS) {
    if (!used.has(key)) return key;
  }
  return STUDENT_CALENDAR_COLOR_KEYS[0];
}

export type StudentCalendarEventColors = {
  bg: string;
  dot: string;
  title: string;
  time: string;
};

/** Schedule grid event chips (FullCalendar custom content). */
export const STUDENT_CALENDAR_EVENT_COLORS: Record<
  StudentCalendarColorKey,
  StudentCalendarEventColors
> = {
  primary: {
    bg: "border border-brand-100 bg-brand-50 dark:border-brand-500/20 dark:bg-brand-500/15",
    dot: "bg-brand-500",
    title: "text-brand-700 dark:text-brand-400",
    time: "text-brand-600/80 dark:text-brand-400/80",
  },
  success: {
    bg: "border border-success-100 bg-success-50 dark:border-success-500/20 dark:bg-success-500/15",
    dot: "bg-success-500",
    title: "text-success-700 dark:text-success-400",
    time: "text-success-600/80 dark:text-success-400/80",
  },
  info: {
    bg: "border border-blue-light-100 bg-blue-light-50 dark:border-blue-light-500/20 dark:bg-blue-light-500/15",
    dot: "bg-blue-light-500",
    title: "text-blue-light-700 dark:text-blue-light-400",
    time: "text-blue-light-600/80 dark:text-blue-light-400/80",
  },
  warning: {
    bg: "border border-orange-100 bg-orange-50 dark:border-orange-500/20 dark:bg-orange-500/15",
    dot: "bg-orange-500",
    title: "text-orange-700 dark:text-orange-400",
    time: "text-orange-600/80 dark:text-orange-400/80",
  },
  danger: {
    bg: "border border-error-100 bg-error-50 dark:border-error-500/20 dark:bg-error-500/15",
    dot: "bg-error-500",
    title: "text-error-700 dark:text-error-400",
    time: "text-error-600/80 dark:text-error-400/80",
  },
  purple: {
    bg: "border border-theme-purple-500/20 bg-theme-purple-500/10 dark:border-theme-purple-500/25 dark:bg-theme-purple-500/15",
    dot: "bg-theme-purple-500",
    title: "text-theme-purple-500 dark:text-theme-purple-500",
    time: "text-theme-purple-500/80",
  },
  pink: {
    bg: "border border-theme-pink-500/20 bg-theme-pink-500/10 dark:border-theme-pink-500/25 dark:bg-theme-pink-500/15",
    dot: "bg-theme-pink-500",
    title: "text-theme-pink-500 dark:text-theme-pink-500",
    time: "text-theme-pink-500/80",
  },
};

/** Initial circle on student lists — matches calendar hue per child. */
export const STUDENT_AVATAR_COLOR_CLASSES: Record<
  StudentCalendarColorKey,
  string
> = {
  primary:
    "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
  success:
    "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  info: "bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-400",
  warning:
    "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
  danger:
    "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
  purple:
    "bg-theme-purple-500/10 text-theme-purple-500 dark:bg-theme-purple-500/15",
  pink: "bg-theme-pink-500/10 text-theme-pink-500 dark:bg-theme-pink-500/15",
};

export function resolveStudentCalendarColorKey(
  key: unknown,
  studentId: string,
): StudentCalendarColorKey {
  if (isStudentCalendarColorKey(key)) return key;
  return calendarColorKeyFromStudentId(studentId);
}
