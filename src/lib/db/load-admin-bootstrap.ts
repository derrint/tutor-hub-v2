import {
  loadAdminBootstrapBilling,
  type AdminBootstrapBillingData,
} from "./load-admin-bootstrap-billing";
import {
  loadAdminBootstrapCore,
  type AdminBootstrapCoreData,
} from "./load-admin-bootstrap-core";

export type { AdminBootstrapCoreData, AdminBootstrapBillingData };

/** Full bootstrap (core + billing) — prefer split loaders for admin layout. */
export type AdminBootstrapData = AdminBootstrapCoreData &
  AdminBootstrapBillingData;

export async function loadAdminBootstrap(): Promise<AdminBootstrapData> {
  const [core, billing] = await Promise.all([
    loadAdminBootstrapCore(),
    loadAdminBootstrapBilling(),
  ]);
  return { ...core, ...billing };
}

export { loadAdminBootstrapCore, loadAdminBootstrapBilling };
