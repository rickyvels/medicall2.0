import { cn } from '@/lib/utils'

const initialsOf = (name: string) => name.replace(/^(Dr\.|Dra\.|Lic\.)\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('')

export function Avatar({ name, hue, className, online }: { name: string; hue: number; className?: string; online?: boolean }) {
  const face = (
    <div
      aria-hidden
      className={cn('grid size-12 shrink-0 place-items-center rounded-full font-display text-lg font-bold text-[#0f3d36]', className)}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 85%), hsl(${(hue + 40) % 360} 70% 78%))` }}
    >
      {initialsOf(name)}
    </div>
  )
  if (online === undefined) return face
  return (
    <span className="relative inline-flex shrink-0 self-start">
      {face}
      <span aria-hidden className={cn('absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-surface', online ? 'bg-primary-strong' : 'bg-border')} />
    </span>
  )
}
