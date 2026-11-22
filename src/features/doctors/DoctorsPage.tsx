import { Search, SlidersHorizontal } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDoctors, useSpecialties } from '@/api/hooks'
import type { DoctorSort } from '@/api/types'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { cn } from '@/lib/utils'
import { DoctorCard } from './DoctorCard'

const sorts: { value: DoctorSort; label: string }[] = [
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'online', label: 'En línea primero' },
  { value: 'price', label: 'Menor precio' },
]

const chip = (on: boolean) => cn('shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95', on ? 'border-primary-strong bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-surface-2')

export default function DoctorsPage() {
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState<string>()
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sort, setSort] = useState<DoctorSort>('rating')
  const deferred = useDeferredValue(query)

  const specialties = useSpecialties()
  const doctors = useDoctors({ query: deferred, specialty, onlineOnly, favoritesOnly, sort })

  return (
    <div className="space-y-5">
      <PageHeader title="Médicos" subtitle="Profesionales independientes con colegiatura verificada. Elige a quien prefieras." action={<Button asChild size="sm" variant="outline" className="hidden sm:inline-flex"><Link to="/pro">Soy profesional</Link></Button>} />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar médicos" placeholder="Nombre, especialidad o motivo…" className="h-12 w-full rounded-full border border-border bg-surface pl-11 pr-4 shadow-soft outline-none focus:border-primary-strong focus:ring-4 focus:ring-primary/30" />
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filtros">
        <button type="button" aria-pressed={!specialty} onClick={() => setSpecialty(undefined)} className={chip(!specialty)}>Todos</button>
        {specialties.data?.map((s) => <button key={s} type="button" aria-pressed={specialty === s} onClick={() => setSpecialty(specialty === s ? undefined : s)} className={chip(specialty === s)}>{s}</button>)}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-pressed={onlineOnly} onClick={() => setOnlineOnly(!onlineOnly)} className={chip(onlineOnly)}>En línea ahora</button>
        <button type="button" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(!favoritesOnly)} className={chip(favoritesOnly)}>Favoritos</button>
        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          <SlidersHorizontal className="size-4" aria-hidden /> <span className="sr-only sm:not-sr-only">Ordenar</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as DoctorSort)} aria-label="Ordenar por" className="h-10 rounded-full border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary-strong">
            {sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {doctors.isError ? <ErrorState onRetry={() => doctors.refetch()} /> : doctors.isPending ? (
        <div className="grid gap-3 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-card" />)}</div>
      ) : doctors.data.length === 0 ? (
        <EmptyState title="No encontramos médicos" description="Prueba con otra búsqueda o quita algunos filtros." action={<Button variant="secondary" onClick={() => { setQuery(''); setSpecialty(undefined); setOnlineOnly(false); setFavoritesOnly(false) }}>Limpiar filtros</Button>} />
      ) : (
        <>
          <p className="text-sm text-muted" aria-live="polite">{doctors.data.length} {doctors.data.length === 1 ? 'profesional' : 'profesionales'}</p>
          <ul className={cn('grid gap-3 md:grid-cols-2', doctors.isPlaceholderData && 'opacity-60 transition-opacity')}>
            {doctors.data.map((d) => <li key={d.id}><DoctorCard doctor={d} /></li>)}
          </ul>
        </>
      )}
    </div>
  )
}
