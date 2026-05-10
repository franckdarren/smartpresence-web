export default function CompaniesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-lg bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>
        <div className="h-9 w-40 rounded-lg bg-muted" />
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
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-4">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="space-y-1">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-20 rounded bg-muted" />
                </div>
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="flex justify-end">
                  <div className="h-8 w-24 rounded-lg bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
