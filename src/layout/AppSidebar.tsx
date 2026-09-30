"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useSidebar } from "../context/SidebarContext";
import {
  CalenderIcon,
  DocsIcon,
  DollarLineIcon,
  FileIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
} from "../icons/index";

type NavItem = {
  key: string;
  path: string;
  icon: React.ReactNode;
};

// TutorHub has a single flat level of navigation — six pages, no submenus.
const navItems: NavItem[] = [
  { key: "dashboard", path: "/", icon: <GridIcon /> },
  { key: "jadwal", path: "/jadwal", icon: <CalenderIcon /> },
  { key: "murid", path: "/murid", icon: <GroupIcon /> },
  { key: "tagihan", path: "/tagihan", icon: <DocsIcon /> },
  { key: "laporan", path: "/laporan", icon: <FileIcon /> },
  { key: "keuangan", path: "/keuangan", icon: <DollarLineIcon /> },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const t = useTranslations("sidebar");
  const tBrand = useTranslations("tutorHub");

  const isWide = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out xl:mt-0 rtl:right-0 rtl:left-auto rtl:border-r-0 rtl:border-l dark:border-gray-800 dark:bg-gray-900",
        isWide ? "w-72.5" : "w-22.5",
        isMobileOpen
          ? "translate-x-0"
          : "-translate-x-full rtl:translate-x-full",
        "xl:translate-x-0 xl:rtl:translate-x-0",
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn("flex py-8", isWide ? "justify-start" : "xl:justify-center")}
      >
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 dark:text-white/90"
        >
          {isWide ? tBrand("brand") : tBrand("brandShort")}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <h2
            className={cn(
              "mb-4 flex text-xs leading-5 text-gray-400 uppercase",
              isWide ? "justify-start" : "xl:justify-center",
            )}
          >
            {isWide ? t("groups.menu") : <HorizontaLDots />}
          </h2>

          <ul className="flex flex-col gap-1">
            {navItems.map((nav) => (
              <li key={nav.key}>
                <Link
                  href={nav.path}
                  className={cn(
                    "group menu-item",
                    nav.path === pathname
                      ? "menu-item-active"
                      : "menu-item-inactive",
                    isWide ? "lg:justify-start" : "lg:justify-center",
                  )}
                >
                  <span
                    className={
                      nav.path === pathname
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }
                  >
                    {nav.icon}
                  </span>
                  {isWide && (
                    <span className="menu-item-text">
                      {t(`items.${nav.key}`)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
