import { PageHeaderSkeleton, CalendarDaySkeleton } from "@/components/ui/loading-skeletons";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-32">
      <PageHeaderSkeleton />
      
      {/* Calendar Grid Skeleton */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week Headers */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={`header-${i}`} className="h-8 bg-secondary/30 rounded-md animate-pulse mb-2" />
        ))}
        
        {/* Days */}
        {Array.from({ length: 35 }).map((_, i) => (
          <CalendarDaySkeleton key={`day-${i}`} />
        ))}
      </div>
    </div>
  );
}
