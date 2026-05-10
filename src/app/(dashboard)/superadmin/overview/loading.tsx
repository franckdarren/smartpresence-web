export default function SuperadminOverviewLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-lg bg-muted" />
        <div className="h-4 w-56 rounded bg-muted" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="h-7 w-12 rounded bg-muted" />
              </div>
              <div className="h-8 w-8 rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="py-3 flex items-center justify-between gap-4">
              <div className="h-4 w-36 rounded bg-muted" />
              <div className="h-5 w-20 rounded-full bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
