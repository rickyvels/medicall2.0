import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './button'
import { Lottie } from './lottie'

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border bg-surface/60 px-6 py-8 text-center">
      <Lottie name="floaty" className="h-32 w-44" />
      <h3 className="text-xl font-bold">{title}</h3>
      {description && <p className="max-w-xs text-sm text-muted">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message = 'No pudimos cargar esta información.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface px-6 py-10 text-center">
      <div className="grid size-14 place-items-center rounded-full bg-danger/25"><AlertTriangle className="size-6" aria-hidden /></div>
      <p className="max-w-xs text-sm text-muted">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Reintentar</Button>}
    </div>
  )
}
