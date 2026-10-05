import { loadAdminBootstrap } from "@/lib/db/load-admin-bootstrap";
import AdminShell from "@/layout/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialData = await loadAdminBootstrap();

  return <AdminShell initialData={initialData}>{children}</AdminShell>;
}
