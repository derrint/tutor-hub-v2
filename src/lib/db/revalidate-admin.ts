import { revalidatePath } from "next/cache";

const ADMIN_ROUTES = [
  "/",
  "/schedule",
  "/students",
  "/parents",
  "/invoices",
  "/reports",
  "/finance",
] as const;

export function revalidateAdminRoutes() {
  for (const route of ADMIN_ROUTES) {
    revalidatePath(route);
  }
}
