import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', {
  variants: {
    tone: {
      mint: 'bg-primary-soft text-foreground',
      lavender: 'bg-lavender-soft text-foreground',
      peach: 'bg-peach-soft text-foreground',
      neutral: 'bg-surface-2 text-muted',
      danger: 'bg-danger/25 text-foreground',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export function Badge({ className, tone, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
