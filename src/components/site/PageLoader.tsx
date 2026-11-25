export function PageLoader({ label = 'loading' }: { label?: string }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center" role="status" aria-live="polite">
      <div className="font-mono text-xs text-muted">
        <span className="text-accent">❯</span> {label}
        <span className="ml-1 inline-block animate-blink text-accent">▋</span>
      </div>
    </div>
  )
}
