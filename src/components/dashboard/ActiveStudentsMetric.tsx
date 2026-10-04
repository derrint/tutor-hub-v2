"use client";

import MetricCard from "@/components/dashboard/MetricCard";
import { useRoster } from "@/context/RosterContext";
import { GroupIcon } from "@/icons";
import { useTranslations } from "next-intl";

const ActiveStudentsMetric: React.FC = () => {
  const t = useTranslations("tutorHub.dashboard");
  const { students } = useRoster();
  const activeStudents = students.filter((s) => s.status === "ACTIVE").length;

  return (
    <MetricCard
      icon={<GroupIcon className="size-6 text-gray-800 dark:text-white/90" />}
      label={t("activeStudents")}
      value={activeStudents}
    />
  );
};

export default ActiveStudentsMetric;
