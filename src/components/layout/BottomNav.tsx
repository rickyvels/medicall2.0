import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { mainNav } from './nav'

export function BottomNav() {
  return (
    <nav aria-label="Principal" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {mainNav.map((n) => (
          <li key={n.to}>
            <NavLink to={n.to} end={n.end} className={({ isActive }) => cn('flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition', isActive ? 'text-foreground' : 'text-muted')}>
              {({ isActive }) => (
                <>
                  <span className={cn('grid h-7 w-12 place-items-center rounded-full transition', isActive && 'bg-primary')}>
                    <n.icon className="size-5" aria-hidden />
                  </span>
                  {n.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
