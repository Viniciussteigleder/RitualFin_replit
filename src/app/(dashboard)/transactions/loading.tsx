import { PageHeaderSkeleton, TransactionListSkeleton } from "@/components/ui/loading-skeletons";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-32">
      <PageHeaderSkeleton />
      <TransactionListSkeleton rows={10} />
    </div>
  );
}
