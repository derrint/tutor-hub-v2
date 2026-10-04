"use client";

import StatusBadge from "@/components/common/StatusBadge";
import Button from "@/components/ui/button/Button";
import { ChatIcon, CheckLineIcon } from "@/icons";
import { useRoster } from "@/context/RosterContext";
import { TUTOR_PROFILE, type InvoicePreview } from "@/lib/mock-data";
import InvoiceWhatsAppPreviewModal from "@/components/invoices/InvoiceWhatsAppPreviewModal";
import { useModal } from "@/hooks/useModal";
import { useInvoices } from "@/context/InvoiceContext";
import {
  buildParentMonthlyWhatsAppMessage,
  buildWaMeUrl,
} from "@/lib/whatsapp";
import {
  formatInvoicePeriodLabel,
  formatInvoiceSessionDays,
  formatRupiah,
} from "@/utils";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

/**
 * One card per parent per month, mirroring the WhatsApp message the tutor
 * already sends by hand: a line per child with the session dates and subtotal,
 * then the grand total.
 */
type InvoiceCardProps = {
  /** Already resolved via `InvoiceProvider` (derive-on-read when unpaid). */
  invoice: InvoicePreview;
  /** Future billing months — no send / status changes. */
  actionsLocked?: boolean;
};

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  actionsLocked = false,
}) => {
  const t = useTranslations("tutorHub.invoices");
  const { setInvoiceStatus } = useInvoices();
  const { getParentById } = useRoster();
  const parent = getParentById(invoice.parentId);

  const {
    isOpen: isPreviewOpen,
    openModal: openPreview,
    closeModal: closePreview,
  } = useModal();

  const whatsAppPayload = useMemo(() => {
    if (actionsLocked || invoice.status !== "UNPAID" || !parent) return null;
    if (invoice.total <= 0 || invoice.children.length === 0) return null;
    const messageText = buildParentMonthlyWhatsAppMessage({
      invoice,
      profile: TUTOR_PROFILE,
      parent,
    });
    return {
      messageText,
      whatsAppUrl: buildWaMeUrl(parent.whatsapp, messageText),
    };
  }, [actionsLocked, invoice, parent]);

  const studentNames = useMemo(
    () => invoice.children.map((c) => c.name),
    [invoice.children],
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6">
        <div>
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            {invoice.parentName}
          </h3>
          <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
            {formatInvoicePeriodLabel(invoice.period)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            variant={invoice.status === "PAID" ? "paid" : "unpaid"}
          />
          {whatsAppPayload && (
            <Button
              size="sm"
              variant="primary"
              startIcon={<ChatIcon className="size-4" />}
              aria-label={t("sendWhatsAppAria", {
                parentName: invoice.parentName,
              })}
              onClick={openPreview}
            >
              {t("sendWhatsApp")}
            </Button>
          )}
          {!actionsLocked && invoice.status === "PAID" && (
            <Button
              size="sm"
              variant="outline"
              aria-label={t("markUnpaidAria", {
                parentName: invoice.parentName,
              })}
              onClick={() => setInvoiceStatus(invoice.id, "UNPAID")}
            >
              {t("markUnpaid")}
            </Button>
          )}
          {!actionsLocked && invoice.status === "UNPAID" && (
            <Button
              size="sm"
              variant="outline"
              startIcon={<CheckLineIcon className="size-4" />}
              aria-label={t("markPaidAria", { parentName: invoice.parentName })}
              onClick={() => setInvoiceStatus(invoice.id, "PAID")}
            >
              {t("markPaid")}
            </Button>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800">
        {invoice.children.length === 0 ? (
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">
            {t("noBillableSessions")}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {invoice.children.map((child) => (
              <li
                key={child.id}
                className="flex items-start justify-between gap-4"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                    {child.name}
                  </span>
                  <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                    {t("sessionCount", { count: child.sessionCount })}
                    {" — "}
                    {formatInvoiceSessionDays(child.sessionDays)}
                  </p>
                </span>
                <span className="text-gray-800 tabular-nums dark:text-white/90">
                  {formatRupiah(child.subtotal)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
          <span className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
            {t("total")}
          </span>
          <span className="text-base font-bold text-gray-800 tabular-nums dark:text-white/90">
            {formatRupiah(invoice.total)}
          </span>
        </div>
      </div>

      {whatsAppPayload && (
        <InvoiceWhatsAppPreviewModal
          isOpen={isPreviewOpen}
          onClose={closePreview}
          parentName={invoice.parentName}
          studentNames={studentNames}
          messageText={whatsAppPayload.messageText}
          whatsAppUrl={whatsAppPayload.whatsAppUrl}
        />
      )}
    </div>
  );
};

export default InvoiceCard;
