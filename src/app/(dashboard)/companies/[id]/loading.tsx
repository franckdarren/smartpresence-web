export default function CompanyDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-muted" />
        <div className="h-8 w-48 rounded-lg bg-muted" />
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="h-5 w-36 rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-5 w-32 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Admins */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="h-9 w-36 rounded-lg bg-muted" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-44 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
