import AdminBillingLoader from "@/components/admin/AdminBillingLoader";
import BillingPendingInvoiceProvider from "@/components/admin/BillingPendingInvoiceProvider";
import BrandedLaunchScreen from "@/components/pwa/BrandedLaunchScreen";
import AdminShell from "@/layout/AdminShell";
import { redirect } from "@/i18n/navigation";
import { loadAdminBootstrapCore } from "@/lib/db/load-admin-bootstrap-core";
import { getActiveTutorId } from "@/lib/tutor-context/get-active-tutor-id";
import { getRequestUser } from "@/lib/tutor-context/get-request-user";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function AdminCoreShell({ children }: { children: React.ReactNode }) {
  const [user, tutorId] = await Promise.all([
    getRequestUser(),
    getActiveTutorId(),
  ]);
  if (user?.role === "ADMIN" && !tutorId) {
    redirect({ href: "/select-tutor", locale: await getLocale() });
  }

  const core = await loadAdminBootstrapCore();

  return (
    <AdminShell initialCore={core}>
      <Suspense
        fallback={
          <BillingPendingInvoiceProvider>{children}</BillingPendingInvoiceProvider>
        }
      >
        <AdminBillingLoader>{children}</AdminBillingLoader>
      </Suspense>
    </AdminShell>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<BrandedLaunchScreen />}>
      <AdminCoreShell>{children}</AdminCoreShell>
    </Suspense>
  );
}
