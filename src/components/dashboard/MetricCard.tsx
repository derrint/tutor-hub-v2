import React from "react";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
      {icon}
    </div>
    <div className="mt-5">
      <span className="text-theme-sm text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <h4 className="mt-2 text-title-sm font-bold tabular-nums text-gray-800 dark:text-white/90">
        {value}
      </h4>
    </div>
  </div>
);

export default MetricCard;
