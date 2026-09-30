/** Dates and numbers are always shown in Indonesian, matching the product copy. */
export const LOCALE = "id-ID";

/**
 * Formats a Rupiah amount the way the tutor writes it by hand, e.g. `Rp 1.500.000`.
 * @example formatRupiah(125000) → "Rp 125.000"
 */
export function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString(LOCALE)}`;
}

/** e.g. `Rabu, 30 September 2026` */
export function formatFullDate(date: Date) {
  return date.toLocaleDateString(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** e.g. `Rabu, 30 September` — used where the year is already implied. */
export function formatDayAndMonth(date: Date) {
  return date.toLocaleDateString(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Calendar month on an invoice — mirrors Prisma `Invoice.month` / `Invoice.year`. */
export type InvoicePeriod = {
  month: number;
  year: number;
};

/** e.g. `September 2026` */
export function formatInvoicePeriodLabel(period: InvoicePeriod) {
  return new Date(period.year, period.month - 1, 1).toLocaleDateString(
    LOCALE,
    { month: "long", year: "numeric" },
  );
}

/**
 * Tagihan line items: day-of-month list only (month is on the card header).
 * @example formatInvoiceSessionDays([2, 30, 7]) → "2, 7, 30"
 */
export function formatInvoiceSessionDays(sessionDays: number[]) {
  return [...sessionDays].sort((a, b) => a - b).join(", ");
}

/**
 * WhatsApp / wa.me prefill: days once, then the month name (no repeated `/9`).
 * @example formatInvoiceSessionDaysForMessage([2, 7, 30], { month: 9, year: 2026 })
 *   → "2, 7, 30 September"
 */
export function formatInvoiceSessionDaysForMessage(
  sessionDays: number[],
  period: InvoicePeriod,
) {
  const days = formatInvoiceSessionDays(sessionDays);
  const monthName = new Date(period.year, period.month - 1, 1).toLocaleDateString(
    LOCALE,
    { month: "long" },
  );
  return `${days} ${monthName}`;
}
