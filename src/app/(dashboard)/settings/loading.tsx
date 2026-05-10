export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-36 rounded-lg bg-muted" />
        <div className="h-4 w-56 rounded bg-muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form skeleton */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="h-5 w-40 rounded bg-muted" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-10 w-full rounded-lg bg-muted" />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <div className="h-9 w-32 rounded-lg bg-muted" />
          </div>
        </div>

        {/* QR Code skeleton */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="h-5 w-28 rounded bg-muted" />
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-48 w-48 rounded-lg bg-muted" />
            <div className="h-4 w-40 rounded bg-muted" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="h-9 flex-1 rounded-lg bg-muted" />
            <div className="h-9 flex-1 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
