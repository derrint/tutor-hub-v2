import type {
  InvoiceChildLine,
  InvoicePreview,
  MockParent,
  TutorProfile,
} from "@/lib/mock-data";
import {
  formatInvoicePeriodMonthIndonesian,
  formatInvoiceSessionDays,
  formatRupiah,
} from "@/utils/format";
import {
  parentMonthlyWhatsAppTemplates,
  type ParentMonthlyWhatsAppTemplateContext,
} from "./templates";

/** Indonesian time-of-day opener for WhatsApp greetings. */
export function getIndonesianTimeOfDayGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

/** "A", "A dan B", or "A, B, dan C" — used in report intro and closing. */
export function formatIndonesianNameList(names: string[]): string {
  const unique = [...new Set(names.filter(Boolean))];
  if (unique.length === 0) return "";
  if (unique.length === 1) return unique[0];
  if (unique.length === 2) return `${unique[0]} dan ${unique[1]}`;
  return `${unique.slice(0, -1).join(", ")}, dan ${unique[unique.length - 1]}`;
}

function feePerSessionFromLine(line: InvoiceChildLine): number {
  if (line.sessionCount <= 0) return 0;
  return Math.round(line.subtotal / line.sessionCount);
}

function buildTemplateContext(
  invoice: InvoicePreview,
  profile: TutorProfile,
  parent: MockParent,
  now: Date,
): ParentMonthlyWhatsAppTemplateContext {
  const childNames = invoice.children.map((c) => c.name);
  const studentNameList = formatIndonesianNameList(childNames);
  const firstFee = invoice.children[0]
    ? feePerSessionFromLine(invoice.children[0])
    : 0;

  return {
    greetingTime: getIndonesianTimeOfDayGreeting(now),
    parentSalutation: parent.salutation,
    studentNameList,
    honorific: parent.honorific,
    periodMonthName: formatInvoicePeriodMonthIndonesian(invoice.period),
    childName: "",
    sessionCount: 0,
    sessionDayList: "",
    feePerSessionLabel: formatRupiah(firstFee),
    totalLabel: formatRupiah(invoice.total),
    bankName: profile.bankName ?? "",
    bankAccountNumber: profile.bankAccountNumber ?? "",
    accountHolderName: profile.accountHolderName ?? "",
  };
}

export type BuildParentMonthlyWhatsAppMessageInput = {
  invoice: InvoicePreview;
  profile: TutorProfile;
  parent: MockParent;
  now?: Date;
};

/**
 * Full `wa.me` prefill: rapot intro + per-child billing (day list; month in sentence)
 * + fee/total + bank + closing. PDF rapot is attached manually in WhatsApp.
 */
export function buildParentMonthlyWhatsAppMessage({
  invoice,
  profile,
  parent,
  now = new Date(),
}: BuildParentMonthlyWhatsAppMessageInput): string {
  const base = buildTemplateContext(invoice, profile, parent, now);
  const blocks: string[] = [
    parentMonthlyWhatsAppTemplates.greeting(base),
    "",
    parentMonthlyWhatsAppTemplates.reportIntro(base),
    "",
  ];

  for (const child of invoice.children) {
    const sessionDayList = formatInvoiceSessionDays(child.sessionDays);
    blocks.push(
      parentMonthlyWhatsAppTemplates.childPayment({
        ...base,
        childName: child.name,
        sessionCount: child.sessionCount,
        sessionDayList,
      }),
      "",
    );
  }

  const fees = invoice.children.map(feePerSessionFromLine);
  const uniformFee =
    fees.length > 0 && fees.every((f) => f === fees[0]);

  if (uniformFee) {
    blocks.push(
      parentMonthlyWhatsAppTemplates.feeAndTotalUniform({
        ...base,
        feePerSessionLabel: formatRupiah(fees[0]),
      }),
    );
  } else {
    for (const child of invoice.children) {
      const fee = feePerSessionFromLine(child);
      blocks.push(
        `Biaya les ${child.name} ${formatRupiah(fee)}/pertemuan (total ${formatRupiah(child.subtotal)}).`,
      );
    }
    blocks.push(
      `Jadi totalnya ${formatRupiah(invoice.total)} ya, ${parent.honorific}`,
    );
  }

  blocks.push(
    "",
    parentMonthlyWhatsAppTemplates.bankTransfer(base),
    "",
    parentMonthlyWhatsAppTemplates.closing(base),
  );

  return blocks.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function buildWaMeUrl(whatsappDigits: string, text: string): string {
  const phone = whatsappDigits.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
