export default function AttendanceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-36 rounded-lg bg-muted" />
          <div className="h-4 w-60 rounded bg-muted" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-muted" />
      </div>

      <div className="h-16 rounded-xl border border-border bg-card" />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/40 px-4 py-3">
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              <div className="grid grid-cols-5 gap-4 items-center">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="h-5 w-20 rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
