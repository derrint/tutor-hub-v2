import { revalidatePath } from "next/cache";

import { PLATFORM_ADMIN_ROUTES } from "@/lib/platform-admin/paths";

const ADMIN_ROUTES = [
  "/",
  "/schedule",
  "/students",
  "/parents",
  "/invoices",
  "/reports",
  "/finance",
  "/settings",
  "/select-tutor",
] as const;

export function revalidateAdminRoutes() {
  for (const route of ADMIN_ROUTES) {
    revalidatePath(route);
  }
}

export function revalidatePlatformAdminRoutes() {
  for (const route of PLATFORM_ADMIN_ROUTES) {
    revalidatePath(route);
  }
}
