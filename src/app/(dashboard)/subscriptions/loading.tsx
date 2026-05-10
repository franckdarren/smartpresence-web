export default function SubscriptionsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-36 rounded-lg bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/40 px-4 py-3">
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              <div className="grid grid-cols-5 gap-4 items-center">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-5 w-20 rounded-full bg-muted" />
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="h-8 w-24 rounded-lg bg-muted ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-44 rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-8 w-28 rounded-lg bg-muted" />
            <div className="h-8 w-24 rounded-lg bg-muted" />
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-4 py-3">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <div className="col-span-2 h-4 w-32 rounded bg-muted" />
                  <div className="h-4 w-20 rounded bg-muted" />
                  <div className="h-4 w-16 rounded bg-muted" />
                  <div className="h-5 w-20 rounded-full bg-muted" />
                  <div className="h-8 w-24 rounded-lg bg-muted ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
