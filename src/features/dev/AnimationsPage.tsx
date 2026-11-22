import { Lottie, type LottieName } from '@/components/ui/lottie'

const names: LottieName[] = ['heartbeat', 'radar', 'success', 'flame', 'floaty', 'sparkle', 'calendar', 'pulse-line']

/** Galería de animaciones (solo desarrollo): revisión visual rápida. */
export default function AnimationsPage() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
      {names.map((n) => (
        <figure key={n} className="rounded-card border border-border bg-surface p-3" data-testid={`anim-${n}`}>
          <Lottie name={n} className="h-40 w-full" />
          <figcaption className="mt-2 text-center text-xs text-muted">{n}</figcaption>
        </figure>
      ))}
    </div>
  )
}
