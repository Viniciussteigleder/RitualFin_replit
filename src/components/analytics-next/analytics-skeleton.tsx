export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 bg-muted/50 rounded-2xl w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-2xl" />
        ))}
      </div>
      <div className="h-96 bg-muted/50 rounded-3xl" />
    </div>
  );
}
