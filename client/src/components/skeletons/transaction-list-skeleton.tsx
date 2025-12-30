/**
 * Transaction List Skeleton
 * Loading state for transactions table
 */

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function TransactionListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-5 py-3 text-left">
                  <Skeleton className="h-3 w-12" />
                </th>
                <th className="px-5 py-3 text-left">
                  <Skeleton className="h-3 w-16" />
                </th>
                <th className="px-5 py-3 text-left">
                  <Skeleton className="h-3 w-24" />
                </th>
                <th className="px-5 py-3 text-right">
                  <Skeleton className="h-3 w-16 ml-auto" />
                </th>
                <th className="px-5 py-3 text-left">
                  <Skeleton className="h-3 w-20" />
                </th>
                <th className="px-5 py-3 text-center">
                  <Skeleton className="h-3 w-16 mx-auto" />
                </th>
                <th className="px-5 py-3 text-center">
                  <Skeleton className="h-3 w-12 mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {Array.from({ length: rows }).map((_, i) => (
                <tr key={i}>
                  <td className="px-5 py-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-5 w-20 ml-auto" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-2.5 w-2.5 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-2">
                      <Skeleton className="h-5 w-12 rounded-md" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
