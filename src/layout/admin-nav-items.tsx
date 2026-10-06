"use client";

import {
  BabyIcon,
  CalenderIcon,
  DollarLineIcon,
  FileIcon,
  GridIcon,
  ReceiptTextIcon,
  UsersIcon,
} from "@/icons";
import type { ComponentType, SVGProps } from "react";

export type AdminNavKey =
  | "dashboard"
  | "schedule"
  | "students"
  | "parents"
  | "invoices"
  | "reports"
  | "finance";

type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type AdminNavItem = {
  key: AdminNavKey;
  path: string;
  Icon: NavIcon;
};

export const sidebarNavIconClass = "size-6 shrink-0";
export const bottomNavIconClass = "size-5 shrink-0";

/** Matches AppBottomNav height (h-16) + safe area. */
export const bottomNavInsetClass =
  "bottom-[calc(4rem+env(safe-area-inset-bottom))]";

export const adminNavItems: AdminNavItem[] = [
  { key: "dashboard", path: "/", Icon: GridIcon },
  { key: "schedule", path: "/schedule", Icon: CalenderIcon },
  { key: "students", path: "/students", Icon: BabyIcon },
  { key: "parents", path: "/parents", Icon: UsersIcon },
  { key: "invoices", path: "/invoices", Icon: ReceiptTextIcon },
  { key: "reports", path: "/reports", Icon: FileIcon },
  { key: "finance", path: "/finance", Icon: DollarLineIcon },
];

export const BOTTOM_NAV_PRIMARY_KEYS = [
  "dashboard",
  "schedule",
  "invoices",
  "finance",
] as const satisfies readonly AdminNavKey[];

export const BOTTOM_NAV_MORE_KEYS = [
  "students",
  "parents",
  "reports",
] as const satisfies readonly AdminNavKey[];

const navItemByKey = Object.fromEntries(
  adminNavItems.map((item) => [item.key, item]),
) as Record<AdminNavKey, AdminNavItem>;

export const bottomNavPrimaryItems = BOTTOM_NAV_PRIMARY_KEYS.map(
  (key) => navItemByKey[key],
);

export const bottomNavMoreItems = BOTTOM_NAV_MORE_KEYS.map(
  (key) => navItemByKey[key],
);

/** Matches sidebar link active state (exact path). */
export function isNavItemActive(pathname: string, path: string): boolean {
  return path === pathname;
}

export function isMoreNavPath(pathname: string): boolean {
  return bottomNavMoreItems.some((item) => isNavItemActive(pathname, item.path));
}
