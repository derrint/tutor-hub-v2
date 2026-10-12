import { BillingInitialProvider } from "@/context/BillingInitialContext";
import { InvoiceProvider } from "@/context/InvoiceContext";
import { loadAdminInitialBilling } from "@/lib/db/load-admin-initial-billing";

/** Loads session window + paid invoices after core shell is visible. */
export default async function AdminBillingLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const billing = await loadAdminInitialBilling();

  return (
    <BillingInitialProvider value={billing}>
      <InvoiceProvider>{children}</InvoiceProvider>
    </BillingInitialProvider>
  );
}
