"use client";

import TutorHubMark from "@/components/branding/TutorHubMark";
import {
  adminNavItems,
  isNavItemActive,
  sidebarNavIconClass,
} from "@/layout/admin-nav-items";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useSidebar } from "../context/SidebarContext";

const AppSidebar: React.FC = () => {
  const { isExpanded, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const t = useTranslations("sidebar");
  const tBrand = useTranslations("tutorHub");

  const isWide = isExpanded || isHovered;

  return (
    <aside
      className={cn(
        "fixed top-0 start-0 z-50 hidden h-full flex-col border-e border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out xl:flex dark:border-gray-800 dark:bg-gray-900",
        isWide ? "w-72.5" : "w-22.5",
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn("flex py-8", isWide ? "justify-start" : "xl:justify-center")}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-brand-500 dark:text-brand-400"
          aria-label={tBrand("brand")}
        >
          <TutorHubMark className={isWide ? "size-9" : "size-10"} />
          {isWide && (
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white/90">
              {tBrand("brand")}
            </span>
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <ul className="flex flex-col gap-1">
            {adminNavItems.map((nav) => {
              const { Icon } = nav;
              const active = isNavItemActive(pathname, nav.path);
              return (
                <li key={nav.key}>
                  <Link
                    href={nav.path}
                    className={cn(
                      "group menu-item",
                      active ? "menu-item-active" : "menu-item-inactive",
                      isWide ? "xl:justify-start" : "xl:justify-center",
                    )}
                  >
                    <span
                      className={
                        active
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }
                    >
                      <Icon className={sidebarNavIconClass} />
                    </span>
                    {isWide && (
                      <span className="menu-item-text">
                        {t(`items.${nav.key}`)}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
