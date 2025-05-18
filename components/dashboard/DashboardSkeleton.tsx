"use client";

export function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>

      {/* Stats row skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="border rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse"></div>
            </div>
            <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
            <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Bottom row skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick actions card skeleton */}
        <div className="border rounded-lg p-4 shadow md:col-span-2">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-6"></div>

          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="flex items-center p-4 border rounded-lg"
              >
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse mr-4"></div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip card skeleton */}
        <div className="border rounded-lg p-4 shadow">
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-6"></div>
          <div className="h-20 bg-gray-50 dark:bg-gray-900 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
