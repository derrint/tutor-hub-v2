import AdminBillingLoader from "@/components/admin/AdminBillingLoader";
import BillingPendingInvoiceProvider from "@/components/admin/BillingPendingInvoiceProvider";
import BrandedLaunchScreen from "@/components/pwa/BrandedLaunchScreen";
import AdminShell from "@/layout/AdminShell";
import { redirect } from "@/i18n/navigation";
import { loadAdminBootstrapCore } from "@/lib/db/load-admin-bootstrap-core";
import { isPlatformAdminPath } from "@/lib/platform-admin/paths";
import { getRequestPathname } from "@/lib/request/get-request-pathname";
import { getActiveTutorId } from "@/lib/tutor-context/get-active-tutor-id";
import { getRequestUser } from "@/lib/tutor-context/get-request-user";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function AdminCoreShell({ children }: { children: React.ReactNode }) {
  const [user, tutorId, pathname] = await Promise.all([
    getRequestUser(),
    getActiveTutorId(),
    getRequestPathname(),
  ]);
  const locale = await getLocale();
  if (
    user?.role === "ADMIN" &&
    !tutorId &&
    !isPlatformAdminPath(pathname)
  ) {
    redirect({ href: "/select-tutor", locale });
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
