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
