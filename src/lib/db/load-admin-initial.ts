import {
  loadAdminInitialBilling,
  type AdminInitialBillingData,
} from "./load-admin-initial-billing";
import {
  loadAdminInitialCore,
  type AdminInitialCoreData,
} from "./load-admin-initial-core";

export type { AdminInitialCoreData, AdminInitialBillingData };

/** Full initial load (core + billing) — prefer split loaders for admin layout. */
export type AdminInitialData = AdminInitialCoreData & AdminInitialBillingData;

export async function loadAdminInitial(): Promise<AdminInitialData> {
  const [core, billing] = await Promise.all([
    loadAdminInitialCore(),
    loadAdminInitialBilling(),
  ]);
  return { ...core, ...billing };
}

export { loadAdminInitialCore, loadAdminInitialBilling };
