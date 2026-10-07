import BrandedLaunchScreen from "@/components/pwa/BrandedLaunchScreen";
import AdminShell from "@/layout/AdminShell";
import { loadAdminBootstrap } from "@/lib/db/load-admin-bootstrap";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function AdminBootstrapShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialData = await loadAdminBootstrap();
  return <AdminShell initialData={initialData}>{children}</AdminShell>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<BrandedLaunchScreen />}>
      <AdminBootstrapShell>{children}</AdminBootstrapShell>
    </Suspense>
  );
}
