// components/dashboard/DashboardSkeleton.tsx
import { Card } from "@/components/ui/Card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} padding="md">
            <div className="animate-pulse flex items-center">
              <div className="h-12 w-12 rounded-md bg-gray-200 dark:bg-gray-700" />
              <div className="ml-5 space-y-2">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <Card.Body className="h-80">
              <div className="animate-pulse h-full w-full bg-gray-200 dark:bg-gray-700 rounded" />
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Tables Skeleton */}
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <Card.Body className="h-64">
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-12 w-full rounded bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}