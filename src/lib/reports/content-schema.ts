import type { Prisma } from "@prisma/client";

export const MONTHLY_REPORT_CONTENT_VERSION = 1 as const;

export type MonthlyReportPhoto = {
  id: string;
  /** Data URL (MVP) or HTTPS blob URL later */
  dataUrl: string;
  caption?: string;
};

export type MonthlyReportContentV1 = {
  version: typeof MONTHLY_REPORT_CONTENT_VERSION;
  canDoThis: string[];
  stillLearning: string[];
  nextGoals: string[];
  photos: MonthlyReportPhoto[];
  notes: string;
};

export type MonthlyReportContent = MonthlyReportContentV1;

export function emptyMonthlyReportContent(): MonthlyReportContentV1 {
  return {
    version: MONTHLY_REPORT_CONTENT_VERSION,
    canDoThis: [],
    stillLearning: [],
    nextGoals: [],
    photos: [],
    notes: "",
  };
}

export function bulletsToText(lines: string[]): string {
  return lines.join("\n");
}

export function textToBullets(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function isPhoto(value: unknown): value is MonthlyReportPhoto {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.dataUrl === "string" &&
    row.dataUrl.length > 0
  );
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

/** Normalizes DB JSON into the current report content shape. */
export function parseMonthlyReportContent(
  raw: Prisma.JsonValue | null | undefined,
): MonthlyReportContentV1 {
  const base = emptyMonthlyReportContent();
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return base;
  }

  const record = raw as Record<string, unknown>;
  if (record.placeholder === true) {
    return base;
  }

  const photosRaw = record.photos;
  const photos: MonthlyReportPhoto[] = [];
  if (Array.isArray(photosRaw)) {
    for (const item of photosRaw) {
      if (isPhoto(item)) {
        photos.push({
          id: item.id,
          dataUrl: item.dataUrl,
          caption:
            typeof item.caption === "string" ? item.caption : undefined,
        });
      }
    }
  }

  return {
    version: MONTHLY_REPORT_CONTENT_VERSION,
    canDoThis: stringArray(record.canDoThis),
    stillLearning: stringArray(record.stillLearning),
    nextGoals: stringArray(record.nextGoals),
    photos,
    notes: typeof record.notes === "string" ? record.notes : "",
  };
}

export function serializeMonthlyReportContent(
  content: MonthlyReportContentV1,
): Prisma.InputJsonValue {
  return {
    version: MONTHLY_REPORT_CONTENT_VERSION,
    canDoThis: content.canDoThis,
    stillLearning: content.stillLearning,
    nextGoals: content.nextGoals,
    photos: content.photos.map((photo) => ({
      id: photo.id,
      dataUrl: photo.dataUrl,
      ...(photo.caption ? { caption: photo.caption } : {}),
    })),
    notes: content.notes,
  };
}
