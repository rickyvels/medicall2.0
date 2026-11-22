import type { AnimationItem } from 'lottie-web'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const loaders = {
  heartbeat: () => import('@/assets/lottie/heartbeat.json'),
  radar: () => import('@/assets/lottie/radar.json'),
  success: () => import('@/assets/lottie/success.json'),
  flame: () => import('@/assets/lottie/flame.json'),
  floaty: () => import('@/assets/lottie/floaty.json'),
  sparkle: () => import('@/assets/lottie/sparkle.json'),
  calendar: () => import('@/assets/lottie/calendar.json'),
  'pulse-line': () => import('@/assets/lottie/pulse-line.json'),
} as const

export type LottieName = keyof typeof loaders

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Animación Lottie con carga diferida (lottie-web light, SVG). Decorativa por defecto (aria-hidden). */
export function Lottie({ name, className, loop = true, label }: { name: LottieName; className?: string; loop?: boolean; label?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let anim: AnimationItem | undefined
    let alive = true
    Promise.all([import('lottie-web/build/player/lottie_light'), loaders[name]()])
      .then(([lib, data]) => {
        if (!alive || !ref.current) return
        anim = lib.default.loadAnimation({
          container: ref.current,
          renderer: 'svg',
          loop,
          autoplay: !reducedMotion(),
          animationData: structuredClone(data.default),
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
        })
      })
      .catch(() => undefined)
    return () => {
      alive = false
      anim?.destroy()
    }
  }, [name, loop])

  return <div ref={ref} className={cn('pointer-events-none select-none', className)} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} />
}
