import Skeleton from "@/components/ui/skeleton/Skeleton";
import { bottomNavContentPaddingClass } from "@/layout/admin-nav-items";

type AdminShellSkeletonProps = {
  children: React.ReactNode;
};

/**
 * Full admin chrome placeholder (sidebar + header + bottom nav).
 * Route `loading.tsx` files use page-only skeletons inside the mounted shell;
 * keep this for rare full-shell previews or future use.
 */
export default function AdminShellSkeleton({
  children,
}: AdminShellSkeletonProps) {
  return (
    <div className="min-h-screen xl:flex" aria-busy="true" aria-live="polite">
      <aside
        className="fixed top-0 start-0 z-50 hidden h-full w-22.5 flex-col border-e border-gray-200 bg-white px-5 py-8 xl:flex dark:border-gray-800 dark:bg-gray-900"
        aria-hidden
      >
        <Skeleton className="mx-auto size-10 rounded-xl" />
        <div className="mt-8 flex flex-col gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </aside>

      <div className="flex-1 xl:ms-[90px]">
        <header className="sticky top-0 z-99999 flex w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex w-full items-center justify-between gap-3 px-3 py-3 sm:px-4 xl:px-6 xl:py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-lg xl:hidden" />
              <Skeleton className="hidden size-8 rounded-lg xl:block" />
              <Skeleton className="h-6 w-24 rounded-md xl:hidden" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-10 rounded-lg" />
              <Skeleton className="size-10 rounded-full" />
            </div>
          </div>
        </header>

        <div
          className={`mx-auto max-w-(--breakpoint-2xl) px-4 pt-4 md:px-6 md:pt-6 xl:px-6 xl:pt-6 ${bottomNavContentPaddingClass}`}
        >
          {children}
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-99999 flex h-16 items-center justify-around border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] xl:hidden dark:border-gray-800 dark:bg-gray-900"
        aria-hidden
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="size-10 rounded-lg" />
        ))}
      </nav>
    </div>
  );
}
