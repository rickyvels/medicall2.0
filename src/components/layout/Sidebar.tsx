import { NavLink } from 'react-router-dom'
import { Lottie } from '@/components/ui/lottie'
import { cn } from '@/lib/utils'
import { useWellness } from '@/api/hooks'
import { Logo } from './Logo'
import { mainNav, secondaryNav } from './nav'

const linkCls = ({ isActive }: { isActive: boolean }) =>
  cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition', isActive ? 'bg-surface-2 text-foreground' : 'text-muted hover:bg-surface-2/70 hover:text-foreground')

export function Sidebar() {
  const { data } = useWellness()
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface px-3 py-5 lg:flex">
      <Logo className="mb-6 px-3" />
      <nav aria-label="Principal" className="space-y-1">
        {mainNav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>
            <n.icon className="size-[18px]" aria-hidden /> {n.label}
          </NavLink>
        ))}
      </nav>
      <p className="mb-2 mt-8 px-3 text-xs font-medium uppercase tracking-wide text-muted">Explorar</p>
      <nav aria-label="Secundario" className="space-y-1">
        {secondaryNav.map((n) => (
          <NavLink key={n.to} to={n.to} className={linkCls}>
            <n.icon className="size-[18px]" aria-hidden /> {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-3 rounded-2xl bg-peach-soft p-4">
        <Lottie name="flame" className="size-12 shrink-0" />
        <div>
          <p className="text-sm font-semibold">Racha de {data?.streak ?? 0} días</p>
          <p className="text-xs text-muted">Check-in diario = puntos Vida.</p>
        </div>
      </div>
    </aside>
  )
}
