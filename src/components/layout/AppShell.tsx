import { Bell, Search } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { Orbs } from '@/components/ui/orbs'
import { BottomNav } from './BottomNav'
import { CommandPalette } from './CommandPalette'
import { Logo } from './Logo'
import { Sidebar } from './Sidebar'
import { ThemeToggle } from './ThemeToggle'

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { pathname } = useLocation()
  return (
    <div className="relative isolate flex min-h-dvh">
      <Orbs className="fixed -z-10 opacity-40 dark:opacity-25" />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur-xl sm:px-6">
          <Logo className="lg:hidden" />
          <button type="button" onClick={() => setSearchOpen(true)} className="mx-auto hidden h-10 w-full max-w-md items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm text-muted transition hover:bg-surface-2 sm:flex" aria-label="Buscar en toda la app">
            <Search className="size-4" aria-hidden /> Buscar síntomas, secciones…
            <kbd className="ml-auto rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px]">⌘ K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <button type="button" onClick={() => setSearchOpen(true)} className="grid size-10 place-items-center rounded-full border border-border bg-surface sm:hidden" aria-label="Buscar"><Search className="size-4" /></button>
            <button type="button" className="grid size-10 place-items-center rounded-full border border-border bg-surface hover:bg-surface-2" aria-label="Notificaciones"><Bell className="size-4" /></button>
            <ThemeToggle />
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
          <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
      <BottomNav />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}
