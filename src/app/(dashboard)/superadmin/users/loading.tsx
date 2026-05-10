export default function SuperadminUsersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-4 w-52 rounded bg-muted" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/40 px-4 py-3">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                  <div className="h-4 w-28 rounded bg-muted" />
                </div>
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-5 w-20 rounded-full bg-muted" />
                <div className="h-4 w-28 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
