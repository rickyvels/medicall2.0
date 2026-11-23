import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { mainNav } from './nav'

export function BottomNav() {
  return (
    <nav
      aria-label="Principal"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {mainNav.map((n) => (
          <li key={n.to}>
            <NavLink
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* pill background */}
                  <span className="relative flex h-7 w-14 items-center justify-center">
                    {isActive && (
                      <motion.span
                        layoutId="bottom-nav-pill"
                        className="absolute inset-0 rounded-full bg-primary"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <motion.span
                      animate={isActive ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="relative z-10"
                    >
                      <n.icon className="size-5" aria-hidden />
                    </motion.span>
                  </span>
                  <span className={cn('transition-all', isActive ? 'opacity-100' : 'opacity-0 max-h-0 overflow-hidden')}>
                    {n.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

