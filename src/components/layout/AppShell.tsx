import { Bell, Search } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { useProfile } from '@/api/hooks'
import { Avatar } from '@/components/ui/avatar'
import { Orbs } from '@/components/ui/orbs'
import { BottomNav } from './BottomNav'
import { CommandPalette } from './CommandPalette'
import { Logo } from './Logo'
import { Sidebar } from './Sidebar'
import { ThemeToggle } from './ThemeToggle'

/** Número de notificaciones no leídas (mock estático — se reemplaza con API real). */
const UNREAD = 2

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { pathname } = useLocation()
  const { data: profile } = useProfile()

  return (
    <div className="relative isolate flex min-h-dvh">
      <Orbs className="fixed -z-10 opacity-40 dark:opacity-25" />
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ── Top Header ── */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/90 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur-xl sm:px-6">
          {/* Logo (mobile only) */}
          <Logo className="lg:hidden" />

          {/* Search bar (desktop) */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="mx-auto hidden h-10 w-full max-w-md items-center gap-2.5 rounded-full border border-border bg-surface px-4 text-sm text-muted shadow-soft transition hover:border-primary/50 hover:bg-surface-2 hover:shadow-none sm:flex"
            aria-label="Buscar en toda la app"
          >
            <Search className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="flex-1 text-left">Buscar síntomas, secciones…</span>
            <kbd className="ml-auto rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium">⌘K</kbd>
          </button>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            {/* Search (mobile) */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid size-10 place-items-center rounded-full border border-border bg-surface transition hover:bg-surface-2 sm:hidden"
              aria-label="Buscar"
            >
              <Search className="size-4" />
            </button>

            {/* Notification bell with badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((p) => !p)}
                className="grid size-10 place-items-center rounded-full border border-border bg-surface transition hover:bg-surface-2"
                aria-label={`Notificaciones${UNREAD > 0 ? `, ${UNREAD} sin leer` : ''}`}
              >
                <Bell className="size-4" />
                {UNREAD > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white"
                  >
                    {UNREAD}
                  </motion.span>
                )}
              </button>

              {/* Notification dropdown */}
              <AnimatePresence>
                {notifOpen && (
                  <>
                    {/* backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-float"
                    >
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <p className="text-sm font-semibold">Notificaciones</p>
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-foreground">{UNREAD} nuevas</span>
                      </div>
                      {[
                        { icon: '🗓️', title: 'Cita confirmada', body: 'Dr. Ramírez · mañana 10:00', time: 'Ahora' },
                        { icon: '⭐', title: '¡10 puntos Vida ganados!', body: 'Por tu check-in de hoy', time: 'Hace 2h' },
                        { icon: '💊', title: 'Receta lista', body: 'Tu receta del 20 nov está disponible', time: 'Ayer' },
                      ].map((n, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNotifOpen(false)}
                          className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-surface-2 ${i < UNREAD ? 'bg-primary-soft/40' : ''}`}
                        >
                          <span className="mt-0.5 text-xl leading-none">{n.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{n.title}</p>
                            <p className="truncate text-xs text-muted">{n.body}</p>
                          </div>
                          <span className="shrink-0 text-[11px] text-muted">{n.time}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <ThemeToggle />

            {/* User avatar (desktop) */}
            {profile && (
              <Avatar
                name={`${profile.firstName} ${profile.lastName}`}
                hue={165}
                className="hidden size-9 cursor-pointer text-sm transition hover:ring-2 hover:ring-primary hover:ring-offset-2 lg:grid"
              />
            )}
          </div>
        </header>

        {/* ── Page content ── */}
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <BottomNav />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
