export default function MySubscriptionLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-52 rounded bg-muted" />
      </div>

      {/* Plan actuel */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="h-5 w-28 rounded bg-muted" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-7 w-32 rounded-full bg-muted" />
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-5 space-y-3">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="grid gap-1.5 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 w-40 rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="h-6 w-24 rounded-full bg-muted" />
            <div className="h-8 w-28 rounded bg-muted" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 w-36 rounded bg-muted" />
              ))}
            </div>
            <div className="h-9 w-full rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
