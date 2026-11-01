"use client";

type ListPageEmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

const ListPageEmptyState: React.FC<ListPageEmptyStateProps> = ({
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white py-10 text-center dark:border-gray-800 dark:bg-white/3">
    <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
      {title}
    </p>
    <p className="max-w-md px-4 text-theme-xs text-gray-500 dark:text-gray-400">
      {description}
    </p>
    {action ? <div className="mt-2">{action}</div> : null}
  </div>
);

export default ListPageEmptyState;
