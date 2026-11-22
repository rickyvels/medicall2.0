import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const orbs = [
  { c: 'var(--primary)', size: 260, x: '-8%', y: '-30%', dx: 24, dy: 18, d: 9 },
  { c: 'var(--lavender)', size: 220, x: '62%', y: '-20%', dx: -20, dy: 24, d: 11 },
  { c: 'var(--peach)', size: 200, x: '40%', y: '60%', dx: 18, dy: -20, d: 10 },
]

/** Orbes de color difuminados que flotan lentamente (estilo ElevenLabs, en pastel). Decorativo. */
export function Orbs({ className, strength = 0.55 }: { className?: string; strength?: number }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {orbs.map((o, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{ width: o.size, height: o.size, left: o.x, top: o.y, background: o.c, opacity: strength }}
          animate={{ x: [0, o.dx, 0], y: [0, o.dy, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: o.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
