"use client";

import StatusBadge from "@/components/common/StatusBadge";
import Button from "@/components/ui/button/Button";
import { ChatIcon, CheckLineIcon } from "@/icons";
import { useAdminBootstrap } from "@/context/AdminBootstrapContext";
import { useRoster } from "@/context/RosterContext";
import type { InvoicePreview } from "@/lib/mock-data";
import InvoiceWhatsAppPreviewModal from "@/components/invoices/InvoiceWhatsAppPreviewModal";
import { useModal } from "@/hooks/useModal";
import { useInvoices } from "@/context/InvoiceContext";
import {
  buildParentMonthlyWhatsAppMessage,
  buildWaMeUrl,
} from "@/lib/whatsapp";
import { isInvoiceOverdue } from "@/lib/invoices/is-invoice-overdue";
import {
  cn,
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

type InvoiceCardActionsProps = {
  invoice: InvoicePreview;
  whatsAppPayload: { messageText: string; whatsAppUrl: string } | null;
  showMarkUnpaid: boolean;
  showMarkPaid: boolean;
  layout: "mobile" | "desktop";
  onOpenWhatsAppPreview: () => void;
  onMarkUnpaid: () => void;
  onMarkPaid: () => void;
};

function InvoiceCardActions({
  invoice,
  whatsAppPayload,
  showMarkUnpaid,
  showMarkPaid,
  layout,
  onOpenWhatsAppPreview,
  onMarkUnpaid,
  onMarkPaid,
}: InvoiceCardActionsProps) {
  const t = useTranslations("tutorHub.invoices");
  const isMobile = layout === "mobile";
  const buttonClass = isMobile
    ? "min-h-11 w-full"
    : "min-h-11 w-full md:min-h-0 md:w-auto";

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        !isMobile && "md:flex-row md:flex-wrap md:items-center md:justify-end",
      )}
    >
      {whatsAppPayload && (
        <Button
          size="sm"
          variant="primary"
          className={buttonClass}
          startIcon={<ChatIcon className="size-4" />}
          aria-label={t("sendWhatsAppAria", {
            parentName: invoice.parentName,
          })}
          onClick={onOpenWhatsAppPreview}
        >
          {t("sendWhatsApp")}
        </Button>
      )}
      {showMarkUnpaid && (
        <Button
          size="sm"
          variant="outline"
          className={buttonClass}
          aria-label={t("markUnpaidAria", {
            parentName: invoice.parentName,
          })}
          onClick={onMarkUnpaid}
        >
          {t("markUnpaid")}
        </Button>
      )}
      {showMarkPaid && (
        <Button
          size="sm"
          variant="outline"
          className={buttonClass}
          startIcon={<CheckLineIcon className="size-4" />}
          aria-label={t("markPaidAria", { parentName: invoice.parentName })}
          onClick={onMarkPaid}
        >
          {t("markPaid")}
        </Button>
      )}
    </div>
  );
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  actionsLocked = false,
}) => {
  const t = useTranslations("tutorHub.invoices");
  const { setInvoiceStatus } = useInvoices();
  const { profile } = useAdminBootstrap();
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
      profile,
      parent,
    });
    return {
      messageText,
      whatsAppUrl: buildWaMeUrl(parent.whatsapp, messageText),
    };
  }, [actionsLocked, invoice, parent, profile]);

  const studentNames = useMemo(
    () => invoice.children.map((c) => c.name),
    [invoice.children],
  );

  const overdue = isInvoiceOverdue({
    period: invoice.period,
    status: invoice.status,
  });

  const showMarkUnpaid =
    !actionsLocked &&
    invoice.status === "PAID" &&
    process.env.NODE_ENV !== "production";

  const showMarkPaid = !actionsLocked && invoice.status === "UNPAID";

  const hasActions =
    Boolean(whatsAppPayload) || showMarkUnpaid || showMarkPaid;

  const actionProps = {
    invoice,
    whatsAppPayload,
    showMarkUnpaid,
    showMarkPaid,
    onOpenWhatsAppPreview: openPreview,
    onMarkUnpaid: () => setInvoiceStatus(invoice.id, "UNPAID"),
    onMarkPaid: () => setInvoiceStatus(invoice.id, "PAID"),
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      <div className="px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {invoice.parentName}
            </h3>
            <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
              {formatInvoicePeriodLabel(invoice.period)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge
                variant={invoice.status === "PAID" ? "paid" : "unpaid"}
              />
              {overdue && (
                <StatusBadge variant="overdue" label={t("overdueLabel")} />
              )}
            </div>
          </div>

          {hasActions && (
            <div className="hidden shrink-0 md:block">
              <InvoiceCardActions {...actionProps} layout="desktop" />
            </div>
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

      {hasActions && (
        <div className="border-t border-gray-100 px-5 pb-4 pt-4 sm:px-6 md:hidden dark:border-gray-800">
          <InvoiceCardActions {...actionProps} layout="mobile" />
        </div>
      )}

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
