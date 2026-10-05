/** Parses `studentId:YYYY-MM-DD` occurrence keys. */
export function parseOccurrenceId(
  occurrenceId: string,
): { studentId: string; year: number; month: number; day: number } | null {
  const colon = occurrenceId.indexOf(":");
  if (colon <= 0) return null;
  const studentId = occurrenceId.slice(0, colon);
  const datePart = occurrenceId.slice(colon + 1);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return null;
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  return { studentId, year, month, day };
}
