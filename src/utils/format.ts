/** UI dates and calendar labels (English). */
export const DISPLAY_LOCALE = "en-US";

/** @deprecated Use DISPLAY_LOCALE; kept for existing imports. */
export const LOCALE = DISPLAY_LOCALE;

/** Thousand separators for Rp amounts (Indonesian convention). */
const RUPIAH_NUMBER_LOCALE = "id-ID";

/** Month names in WhatsApp invoice prefill (Bahasa). */
const WHATSAPP_LOCALE = "id-ID";

/**
 * Formats a Rupiah amount the way the tutor writes it by hand, e.g. `Rp 1.500.000`.
 * @example formatRupiah(125000) → "Rp 125.000"
 */
export function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString(RUPIAH_NUMBER_LOCALE)}`;
}

/** e.g. `Wednesday, September 30, 2026` */
export function formatFullDate(date: Date) {
  return date.toLocaleDateString(DISPLAY_LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** e.g. `Wednesday, September 30` — used where the year is already implied. */
export function formatDayAndMonth(date: Date) {
  return date.toLocaleDateString(DISPLAY_LOCALE, {
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
    DISPLAY_LOCALE,
    { month: "long", year: "numeric" },
  );
}

/** Bahasa month name for WhatsApp copy, e.g. `September`. */
export function formatInvoicePeriodMonthIndonesian(period: InvoicePeriod) {
  return new Date(period.year, period.month - 1, 1).toLocaleDateString(
    WHATSAPP_LOCALE,
    { month: "long" },
  );
}

/**
 * Invoice line items: day-of-month list only (month is on the card header).
 * @example formatInvoiceSessionDays([2, 30, 7]) → "2, 7, 30"
 */
export function formatInvoiceSessionDays(sessionDays: number[]) {
  return [...sessionDays].sort((a, b) => a - b).join(", ");
}

/**
 * WhatsApp / wa.me prefill: days once, then the month name in Bahasa (no repeated `/9`).
 * @example formatInvoiceSessionDaysForMessage([2, 7, 30], { month: 9, year: 2026 })
 *   → "2, 7, 30 September"
 */
export function formatInvoiceSessionDaysForMessage(
  sessionDays: number[],
  period: InvoicePeriod,
) {
  const days = formatInvoiceSessionDays(sessionDays);
  const monthName = new Date(period.year, period.month - 1, 1).toLocaleDateString(
    WHATSAPP_LOCALE,
    { month: "long" },
  );
  return `${days} ${monthName}`;
}
