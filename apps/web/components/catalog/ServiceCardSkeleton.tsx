export default function ServiceCardSkeleton() {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3 animate-pulse"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-4 w-3/4 rounded" style={{ background: "var(--border)" }} />
          <div className="h-3 w-1/2 rounded" style={{ background: "var(--border)" }} />
        </div>
        <div className="h-6 w-20 rounded-lg" style={{ background: "var(--border)" }} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="h-3 w-full rounded" style={{ background: "var(--border)" }} />
        <div className="h-3 w-4/5 rounded"  style={{ background: "var(--border)" }} />
      </div>

      <div className="flex gap-2">
        <div className="h-5 w-14 rounded-md" style={{ background: "var(--border)" }} />
        <div className="h-5 w-10 rounded-md" style={{ background: "var(--border)" }} />
      </div>

      <div className="flex gap-1.5">
        <div className="h-4 w-14 rounded" style={{ background: "var(--border)" }} />
        <div className="h-4 w-16 rounded" style={{ background: "var(--border)" }} />
        <div className="h-4 w-12 rounded" style={{ background: "var(--border)" }} />
      </div>

      <div className="mt-auto pt-2 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="h-3 w-2/3 rounded" style={{ background: "var(--border)" }} />
      </div>
    </div>
  )
}