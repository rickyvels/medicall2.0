export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden><rect width="32" height="32" rx="9" fill="var(--primary)" /><path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="var(--primary-foreground)" /></svg>
      <span className="font-display text-xl font-bold tracking-tight">MediCall</span>
    </div>
  )
}
