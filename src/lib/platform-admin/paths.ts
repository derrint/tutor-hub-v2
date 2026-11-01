export const PLATFORM_ADMIN_ROUTES = ["/admin/tutors", "/admin/users"] as const;

export function isPlatformAdminPath(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  return PLATFORM_ADMIN_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
}
