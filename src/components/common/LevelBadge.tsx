import Badge from "@/components/ui/badge/Badge";
import type { EducationLevel } from "@/lib/mock-data";
import React from "react";

const LEVEL_COLOR = {
  TK: "primary",
  SD: "warning",
} as const;

/**
 * Education level badge, used everywhere a student is shown (lists, calendar,
 * session detail, reports) so TK and SD always read the same colour.
 */
const LevelBadge: React.FC<{ level: EducationLevel }> = ({ level }) => (
  <Badge size="sm" color={LEVEL_COLOR[level]}>
    {level}
  </Badge>
);

export default LevelBadge;
