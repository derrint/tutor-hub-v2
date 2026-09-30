import { Link } from "@/i18n/navigation";
import { ArrowRightIcon } from "@/icons";
import React from "react";

const SeeAllLink: React.FC<{ href: string; label: string }> = ({
  href,
  label,
}) => (
  <Link
    href={href}
    className="inline-flex items-center gap-1 text-theme-sm text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
  >
    {label}
    <ArrowRightIcon className="size-4 rtl:rotate-180" />
  </Link>
);

export default SeeAllLink;
