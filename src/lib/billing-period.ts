import type { InvoicePeriod } from "@/utils/format";

/** URL query value, e.g. `2026-09`. */
export function formatBillingMonthParam(period: InvoicePeriod): string {
  const mm = String(period.month).padStart(2, "0");
  return `${period.year}-${mm}`;
}

export function parseBillingMonthParam(
  value: string | null | undefined,
): InvoicePeriod | null {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
  const [yearStr, monthStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }
  return { year, month };
}

/** Calendar month containing `date` (defaults to today). */
export function getCurrentInvoicePeriod(
  date: Date = new Date(),
): InvoicePeriod {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

export function shiftInvoicePeriod(
  period: InvoicePeriod,
  deltaMonths: number,
): InvoicePeriod {
  const anchor = new Date(period.year, period.month - 1 + deltaMonths, 1);
  return {
    year: anchor.getFullYear(),
    month: anchor.getMonth() + 1,
  };
}

/** `-1` past, `0` current calendar month, `1` future. */
export function comparePeriodToCalendarMonth(
  period: InvoicePeriod,
  reference: Date = new Date(),
): -1 | 0 | 1 {
  const refYear = reference.getFullYear();
  const refMonth = reference.getMonth() + 1;

  if (period.year !== refYear) {
    return period.year < refYear ? -1 : 1;
  }
  if (period.month !== refMonth) {
    return period.month < refMonth ? -1 : 1;
  }
  return 0;
}

export function isFutureBillingPeriod(
  period: InvoicePeriod,
  reference: Date = new Date(),
): boolean {
  return comparePeriodToCalendarMonth(period, reference) === 1;
}

export function periodsEqual(a: InvoicePeriod, b: InvoicePeriod): boolean {
  return a.year === b.year && a.month === b.month;
}

/** Value for `<input type="month" />`. */
export function toMonthInputValue(period: InvoicePeriod): string {
  return formatBillingMonthParam(period);
}

export function periodFromMonthInputValue(value: string): InvoicePeriod | null {
  return parseBillingMonthParam(value);
}
