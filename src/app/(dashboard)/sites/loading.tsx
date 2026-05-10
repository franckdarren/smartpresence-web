export default function SitesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded-lg bg-muted" />
          <div className="h-4 w-72 rounded bg-muted" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="h-5 w-32 rounded bg-muted" />
                <div className="h-4 w-48 rounded bg-muted" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 rounded-lg bg-muted" />
                <div className="h-8 w-8 rounded-lg bg-muted" />
              </div>
            </div>
            <div className="h-32 w-full rounded-lg bg-muted" />
            <div className="flex gap-2 pt-1">
              <div className="h-8 flex-1 rounded-lg bg-muted" />
              <div className="h-8 flex-1 rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
