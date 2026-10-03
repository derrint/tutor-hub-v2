/**
 * Indonesian WhatsApp copy for the combined monthly send (rapot + invoice).
 * Dashboard UI stays English; only outbound parent messages use these strings.
 *
 * Placeholders are filled by `buildParentMonthlyWhatsAppMessage` — keep wording
 * aligned with `PRODUCT.md` (real tutor example).
 */

export type ParentMonthlyWhatsAppTemplateContext = {
  /** e.g. "Selamat siang" */
  greetingTime: string;
  /** e.g. "Mama Askara dan Arga" */
  parentSalutation: string;
  /** e.g. "Askara dan Arga" */
  studentNameList: string;
  /** Short honorific after "ya," — e.g. "Ma." */
  honorific: string;
  /** Bahasa month name, e.g. "September" */
  periodMonthName: string;
  childName: string;
  sessionCount: number;
  /** From `formatInvoiceSessionDays` — e.g. "2, 7, 30" (month is in the sentence above) */
  sessionDayList: string;
  feePerSessionLabel: string;
  totalLabel: string;
  bankName: string;
  bankAccountNumber: string;
  accountHolderName: string;
};

/** Editable template blocks (Bahasa Indonesia). */
export const parentMonthlyWhatsAppTemplates = {
  greeting: ({ greetingTime, parentSalutation }: ParentMonthlyWhatsAppTemplateContext) =>
    `${greetingTime}, ${parentSalutation} 😊`,

  reportIntro: ({
    studentNameList,
    honorific,
  }: ParentMonthlyWhatsAppTemplateContext) =>
    `Berikut ini saya mengirimkan rapot perkembangan ${studentNameList} selama mengikuti les ya, ${honorific} Di dalamnya ada beberapa kemampuan yang sudah ${studentNameList} kuasai, hal-hal yang masih sedang dikembangkan, serta target belajar untuk bulan berikutnya. 🌱`,

  childPayment: ({
    childName,
    periodMonthName,
    sessionCount,
    sessionDayList,
  }: ParentMonthlyWhatsAppTemplateContext) =>
    `Untuk pembayaran les ${childName}, selama bulan ${periodMonthName} ini ada ${sessionCount} kali pertemuan, yaitu tanggal: ${sessionDayList}`,

  feeAndTotalUniform: ({
    feePerSessionLabel,
    totalLabel,
    honorific,
  }: ParentMonthlyWhatsAppTemplateContext) =>
    `Biaya les ${feePerSessionLabel}/pertemuan, jadi totalnya ${totalLabel} ya, ${honorific}`,

  bankTransfer: ({
    bankName,
    bankAccountNumber,
    accountHolderName,
  }: ParentMonthlyWhatsAppTemplateContext) =>
    `Bisa transfer ke:\n${bankName} - ${bankAccountNumber}\nA/n ${accountHolderName}`,

  closing: ({
    studentNameList,
    honorific,
  }: ParentMonthlyWhatsAppTemplateContext) =>
    `Terima kasih banyak untuk kepercayaan dan support-nya selama ini. Semoga ${studentNameList} semakin semangat belajar dan terus berkembang ya, ${honorific} 🤍✨`,
} as const;
