import Badge from "@/components/ui/badge/Badge";
import { useTranslations } from "next-intl";
import React from "react";

export type StatusVariant =
  | "scheduled"
  | "attended"
  | "absent"
  | "active"
  | "inactive"
  | "paid"
  | "unpaid"
  | "draft"
  | "published";

// Everything that counts (attended, paid, active, published) is success;
// everything still waiting on the tutor or the parent is warning; everything
// switched off (absent, inactive) is a solid grey so it never reads as "done".
const STATUS_COLOR = {
  scheduled: "light",
  attended: "success",
  absent: "dark",
  active: "success",
  inactive: "dark",
  paid: "success",
  unpaid: "warning",
  draft: "warning",
  published: "success",
} as const;

const StatusBadge: React.FC<{ variant: StatusVariant; label?: string }> = ({
  variant,
  label,
}) => {
  const t = useTranslations("tutorHub.status");

  return (
    <Badge size="sm" color={STATUS_COLOR[variant]}>
      {label ?? t(variant)}
    </Badge>
  );
};

export default StatusBadge;
