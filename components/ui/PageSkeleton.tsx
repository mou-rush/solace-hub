export function PageSkeleton() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      {/* Page title */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-72 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>

      {/* Content block */}
      <div className="space-y-4">
        <div className="h-40 w-full bg-gray-100 dark:bg-gray-800 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        </div>
        <div className="h-24 w-full bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}
