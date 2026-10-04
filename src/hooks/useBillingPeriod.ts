"use client";

import {
  formatBillingMonthParam,
  getCurrentInvoicePeriod,
  parseBillingMonthParam,
  shiftInvoicePeriod,
} from "@/lib/billing-period";
import type { InvoicePeriod } from "@/utils/format";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

const STORAGE_KEY = "tutorhub-billing-month";

function readStoredBillingMonth(): InvoicePeriod | null {
  if (typeof window === "undefined") return null;
  try {
    return parseBillingMonthParam(
      window.sessionStorage.getItem(STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

function writeStoredBillingMonth(period: InvoicePeriod) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      formatBillingMonthParam(period),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

export function useBillingPeriod() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const didSyncUrl = useRef(false);

  const period = useMemo(() => {
    const parsed = parseBillingMonthParam(searchParams.get("month"));
    if (parsed) return parsed;
    return readStoredBillingMonth() ?? getCurrentInvoicePeriod();
  }, [searchParams]);

  const monthParam = useMemo(
    () => formatBillingMonthParam(period),
    [period],
  );

  const setPeriod = useCallback(
    (next: InvoicePeriod) => {
      writeStoredBillingMonth(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", formatBillingMonthParam(next));
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  /** Keep `?month=` on the URL when switching pages via sidebar (session fallback). */
  useEffect(() => {
    if (didSyncUrl.current) return;
    if (searchParams.get("month")) {
      didSyncUrl.current = true;
      const fromUrl = parseBillingMonthParam(searchParams.get("month"));
      if (fromUrl) writeStoredBillingMonth(fromUrl);
      return;
    }
    didSyncUrl.current = true;
    const next = readStoredBillingMonth() ?? getCurrentInvoicePeriod();
    setPeriod(next);
  }, [searchParams, setPeriod]);

  const goToPreviousMonth = useCallback(() => {
    setPeriod(shiftInvoicePeriod(period, -1));
  }, [period, setPeriod]);

  const goToNextMonth = useCallback(() => {
    setPeriod(shiftInvoicePeriod(period, 1));
  }, [period, setPeriod]);

  return {
    period,
    monthParam,
    setPeriod,
    goToPreviousMonth,
    goToNextMonth,
  };
}

/** Links that should preserve the selected billing month. */
export function billingMonthHref(
  path: string,
  monthParam: string,
): `${string}?month=${string}` {
  return `${path}?month=${monthParam}`;
}
