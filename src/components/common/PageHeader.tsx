import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
}) => {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
};

export default PageHeader;
