import AdminBillingLoader from "@/components/admin/AdminBillingLoader";
import BillingPendingInvoiceProvider from "@/components/admin/BillingPendingInvoiceProvider";
import BrandedLaunchScreen from "@/components/pwa/BrandedLaunchScreen";
import AdminShell from "@/layout/AdminShell";
import { loadAdminBootstrapCore } from "@/lib/db/load-admin-bootstrap-core";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function AdminCoreShell({ children }: { children: React.ReactNode }) {
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
