import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSymptoms } from '@/api/hooks'
import { Sheet } from '@/components/ui/sheet'
import { mainNav, secondaryNav } from './nav'

/** Buscador global (⌘K / Ctrl+K), estilo ElevenLabs. */
export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const { data: symptoms = [] } = useSymptoms()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  const items = useMemo(() => {
    const all = [
      ...symptoms.map((s) => ({ key: `s-${s.id}`, label: s.label, hint: 'Iniciar triaje', to: `/triaje/${s.id}` })),
      ...[...mainNav, ...secondaryNav].map((n) => ({ key: n.to, label: n.label, hint: 'Ir a', to: n.to })),
    ]
    const term = q.trim().toLowerCase()
    return term ? all.filter((i) => i.label.toLowerCase().includes(term)) : all
  }, [q, symptoms])

  return (
    <Sheet open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setQ('') }} title="Buscar" description="Busca síntomas o secciones de la app">
      <div className="relative mb-3">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca un síntoma o sección…" aria-label="Buscar" className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 outline-none focus:border-primary-strong focus:ring-4 focus:ring-primary/30" />
      </div>
      <ul className="max-h-72 space-y-1 overflow-y-auto">
        {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">Sin resultados</li>}
        {items.map((i) => (
          <li key={i.key}>
            <button type="button" onClick={() => { onOpenChange(false); setQ(''); nav(i.to) }} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm hover:bg-surface-2">
              <span className="font-medium">{i.label}</span><span className="text-xs text-muted">{i.hint}</span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
