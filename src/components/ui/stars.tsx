import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span role="img" aria-label={`${value.toFixed(1)} de 5 estrellas`} className={cn('inline-flex', className)}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} aria-hidden className={cn('size-4', value >= n - 0.25 ? 'fill-warning text-warning' : 'text-border')} />)}
    </span>
  )
}
