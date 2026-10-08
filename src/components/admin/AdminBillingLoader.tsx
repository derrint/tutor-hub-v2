import { BillingBootstrapProvider } from "@/context/BillingBootstrapContext";
import { InvoiceProvider } from "@/context/InvoiceContext";
import { loadAdminBootstrapBilling } from "@/lib/db/load-admin-bootstrap-billing";

/** Loads session window + paid invoices after core shell is visible. */
export default async function AdminBillingLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const billing = await loadAdminBootstrapBilling();

  return (
    <BillingBootstrapProvider value={billing}>
      <InvoiceProvider>{children}</InvoiceProvider>
    </BillingBootstrapProvider>
  );
}
