import type { InvoicePeriod } from "@/utils/format";

export function buildMonthlyReportPdfFilename(
  studentName: string,
  period: InvoicePeriod,
): string {
  const safeName = studentName
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 48);
  const month = String(period.month).padStart(2, "0");
  return `Rapot-${safeName || "student"}-${period.year}-${month}.pdf`;
}
