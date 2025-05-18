"use client";

import Link from "next/link";

export function QuickActionsGrid({ actions }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {actions.map((action, index) => (
        <Link href={action.href} key={index}>
          <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow group">
            <div
              className="mr-4 rounded-full bg-teal-100 p-2 text-teal-600 dark:bg-teal-900 dark:text-teal-300 
                           group-hover:bg-teal-200 dark:group-hover:bg-teal-800 transition-colors"
            >
              {action.icon}
            </div>
            <div>
              <h3 className="font-medium">{action.title}</h3>
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
