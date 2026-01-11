import { PageHeaderSkeleton, AccountCardSkeleton } from "@/components/ui/loading-skeletons";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-32">
      <PageHeaderSkeleton />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <AccountCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
