import { NavLink, Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { Lottie } from '@/components/ui/lottie'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useProfile, useWellness } from '@/api/hooks'
import { Logo } from './Logo'
import { mainNav, secondaryNav } from './nav'
import { ThemeToggle } from './ThemeToggle'

const linkCls = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
    isActive
      ? 'bg-primary/15 text-foreground shadow-soft'
      : 'text-muted hover:bg-surface-2/70 hover:text-foreground'
  )

const activeDot = ({ isActive }: { isActive: boolean }) =>
  isActive ? (
    <span className="ml-auto size-1.5 rounded-full bg-primary-strong" aria-hidden />
  ) : null

export function Sidebar() {
  const { data: wellness } = useWellness()
  const { data: profile } = useProfile()

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      {/* ── Brand ── */}
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <Logo />
        <ThemeToggle />
      </div>

      {/* ── User card ── */}
      {profile && (
        <Link
          to="/perfil"
          className="mx-3 mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface-2/60 p-3 transition hover:bg-surface-2"
        >
          <Avatar name={`${profile.firstName} ${profile.lastName}`} hue={165} className="size-9 text-sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{profile.firstName} {profile.lastName}</p>
            <p className="truncate text-xs text-muted">{profile.email}</p>
          </div>
          <Settings className="size-4 shrink-0 text-muted" aria-hidden />
        </Link>
      )}

      {/* ── Main nav ── */}
      <nav aria-label="Principal" className="mt-4 space-y-0.5 px-3">
        {mainNav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>
            {({ isActive }) => (
              <>
                <span className={cn('grid size-7 shrink-0 place-items-center rounded-lg transition', isActive ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted')}>
                  <n.icon className="size-4" aria-hidden />
                </span>
                {n.label}
                {activeDot({ isActive })}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Secondary nav ── */}
      <p className="mb-1 mt-6 px-6 text-xs font-semibold uppercase tracking-widest text-muted/70">Explorar</p>
      <nav aria-label="Secundario" className="space-y-0.5 px-3">
        {secondaryNav.map((n) => (
          <NavLink key={n.to} to={n.to} className={linkCls}>
            {({ isActive }) => (
              <>
                <span className={cn('grid size-7 shrink-0 place-items-center rounded-lg transition', isActive ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted')}>
                  <n.icon className="size-4" aria-hidden />
                </span>
                {n.label}
                {activeDot({ isActive })}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Streak card ── */}
      <div className="mx-3 mb-4 mt-auto overflow-hidden rounded-2xl bg-gradient-to-br from-peach-soft to-primary-soft p-4">
        <div className="flex items-center gap-3">
          <Lottie name="flame" className="size-10 shrink-0" />
          <div>
            <p className="text-sm font-bold">Racha de {wellness?.streak ?? 0} días</p>
            <p className="text-xs text-muted">Check-in diario = puntos Vida</p>
          </div>
        </div>
        {wellness && (
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface/60">
              <div
                className="h-full rounded-full bg-primary-strong transition-all"
                style={{ width: `${Math.min((wellness.xpIntoLevel / (wellness.xpForNextLevel || 1)) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted">{wellness.xp} pts</span>
          </div>
        )}
      </div>
    </aside>
  )
}

