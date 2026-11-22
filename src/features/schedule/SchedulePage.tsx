import { ArrowLeft, BadgeCheck, CalendarPlus, Search, SlidersHorizontal, Star, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useDeferredValue, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAvailability, useBookAppointment, useSpecialties, useSymptoms } from '@/api/hooks'
import type { Appointment, AvailabilitySort, Doctor } from '@/api/types'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lottie } from '@/components/ui/lottie'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { downloadIcs } from '@/lib/ics'
import { cn, formatLongDate, formatPEN, formatTime, toDateKey } from '@/lib/utils'

const DAYS_AHEAD = 14
const weekday = new Intl.DateTimeFormat('es-PE', { weekday: 'short' })
const month = new Intl.DateTimeFormat('es-PE', { month: 'short' })

const dayPills = () =>
  Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return { key: toDateKey(d), wd: i === 0 ? 'Hoy' : weekday.format(d).replace('.', ''), day: d.getDate(), mo: month.format(d).replace('.', '') }
  })

const SLOTS_PREVIEW = 4
const sorts: { value: AvailabilitySort; label: string }[] = [
  { value: 'fair', label: 'Rotación equitativa' },
  { value: 'soonest', label: 'Más pronto' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'price', label: 'Menor precio' },
]
const chip = (on: boolean) => cn('shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95', on ? 'border-primary-strong bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-surface-2')

interface Selection { doctor: Doctor; slot: string }

export default function SchedulePage() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const pinId = params.get('doctor') ?? undefined
  const symptoms = useSymptoms()
  const specialties = useSpecialties()
  const book = useBookAppointment()
  const days = useMemo(() => dayPills(), [])

  const [date, setDate] = useState(days[0].key)
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState<string>()
  const [sort, setSort] = useState<AvailabilitySort>('fair')
  const [seed] = useState(() => Math.random().toString(36).slice(2))
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [sel, setSel] = useState<Selection | null>(null)
  const [reason, setReason] = useState('')
  const [done, setDone] = useState<Appointment | null>(null)
  const deferred = useDeferredValue(query)

  const results = useAvailability({ date, query: deferred, specialty, sort, seed, pinId })
  const rows = results.data?.pages.flatMap((p) => p.items) ?? []
  const total = results.data?.pages[0]?.total ?? 0
  const doctor = sel?.doctor
  const slot = sel?.slot ?? null

  const confirm = () => {
    if (!sel) return
    book.mutate({ doctorId: sel.doctor.id, startsAt: sel.slot, reason }, {
      onSuccess: setDone,
      onError: (e) => { toast.error(e.message); setSel(null); results.refetch() },
    })
  }

  const assignRandom = () => {
    const pool = rows.filter((r) => r.slots.length > 0)
    if (!pool.length) return
    const r = pool[Math.floor(Math.random() * pool.length)]
    setSel({ doctor: r.doctor, slot: r.slots[Math.floor(Math.random() * r.slots.length)] })
  }
  const clear = () => { setQuery(''); setSpecialty(undefined) }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto flex max-w-md flex-col items-center pt-6 text-center" role="status">
        <Lottie name="success" loop={false} className="size-56" />
        <h1 className="text-3xl font-bold">¡Cita confirmada!</h1>
        <p className="mt-2 text-sm text-muted">{done.doctor.name} te espera</p>
        <p className="mt-1 font-display text-2xl font-bold first-letter:uppercase">{formatLongDate(done.startsAt)}</p>
        <p className="font-display text-4xl font-bold">{formatTime(done.startsAt)}</p>
        <p className="mt-3 max-w-xs text-xs text-muted">Te avisaremos antes de la cita. Podrás unirte desde "Consultas" 10 minutos antes. +10 puntos Vida por cuidarte.</p>
        <div className="mt-8 w-full space-y-3">
          <Button size="lg" className="w-full" onClick={() => downloadIcs(done)}><CalendarPlus className="size-4" /> Agregar a mi calendario</Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => nav('/consultas', { replace: true })}>Ver mis citas</Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Volver" onClick={() => nav(-1)} className="grid size-10 place-items-center rounded-full bg-surface-2 hover:bg-border"><ArrowLeft className="size-4" /></button>
        <div><h1 className="text-3xl font-bold">Agenda tu teleconsulta</h1><p className="text-sm text-muted">Elige día y compara profesionales disponibles. Cancela gratis hasta 2 h antes.</p></div>
      </div>

      <section aria-labelledby="s-day" className="space-y-3">
        <h2 id="s-day" className="text-xl font-bold">1. Día</h2>
        <div role="radiogroup" aria-label="Día" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {days.map((d) => {
            const on = d.key === date
            return (
              <button key={d.key} type="button" role="radio" aria-checked={on} onClick={() => { setDate(d.key); setSel(null); setExpanded(new Set()) }}
                className={cn('flex w-16 shrink-0 flex-col items-center rounded-2xl border py-3 transition active:scale-95', on ? 'border-primary-strong bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-surface-2')}>
                <span className="text-xs capitalize opacity-80">{d.wd}</span>
                <span className="font-display text-2xl font-bold">{d.day}</span>
                <span className="text-[10px] uppercase opacity-70">{d.mo}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="s-doc" className="space-y-3">
        <h2 id="s-doc" className="text-xl font-bold">2. Médico y hora</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar profesionales" placeholder="Nombre, especialidad o motivo…" className="h-12 w-full rounded-full border border-border bg-surface pl-11 pr-4 shadow-soft outline-none focus:border-primary-strong focus:ring-4 focus:ring-primary/30" />
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Especialidad">
          <button type="button" aria-pressed={!specialty} onClick={() => setSpecialty(undefined)} className={chip(!specialty)}>Todas</button>
          {specialties.data?.map((x) => <button key={x} type="button" aria-pressed={specialty === x} onClick={() => setSpecialty(specialty === x ? undefined : x)} className={chip(specialty === x)}>{x}</button>)}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted" aria-live="polite">{results.isPending ? 'Buscando profesionales…' : `${total} ${total === 1 ? 'profesional disponible' : 'profesionales disponibles'}`}</p>
          <label className="ml-auto flex items-center gap-2 text-sm text-muted">
            <SlidersHorizontal className="size-4" aria-hidden /> <span className="sr-only sm:not-sr-only">Ordenar</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as AvailabilitySort)} aria-label="Ordenar por" className="h-10 rounded-full border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary-strong">
              {sorts.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
            </select>
          </label>
        </div>

        {rows.length > 1 && !sel && (
          <button type="button" onClick={assignRandom} className="flex w-full items-center gap-3 rounded-card border border-primary-strong/40 bg-primary-soft p-4 text-left transition hover:brightness-95 active:scale-[0.99]">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Zap className="size-4" aria-hidden /></span>
            <span className="min-w-0 flex-1"><b className="block">Asignarme un profesional</b><span className="block text-sm text-muted">Te asignamos uno al azar entre los disponibles. Todos tienen las mismas oportunidades.</span></span>
          </button>
        )}

        {results.isError ? <ErrorState onRetry={() => results.refetch()} /> : results.isPending ? (
          <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-card" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState title="Nadie con cupos este día" description="Prueba con otro día, otra especialidad o quita la búsqueda." action={<div className="flex flex-col items-center gap-3"><Lottie name="calendar" className="h-24 w-24" /><Button variant="secondary" onClick={clear}>Quitar filtros</Button></div>} />
        ) : (
          <ul className={cn('grid gap-3 sm:grid-cols-2', results.isFetching && !results.isFetchingNextPage && 'opacity-60 transition-opacity')} role="list">
            {rows.map(({ doctor: d, slots }) => {
              const open = expanded.has(d.id)
              const shown = open ? slots : slots.slice(0, SLOTS_PREVIEW)
              const mine = sel?.doctor.id === d.id
              return (
                <li key={d.id} className={cn('flex flex-col rounded-card border bg-surface p-4 shadow-soft transition', mine ? 'border-primary-strong ring-2 ring-primary/40' : 'border-border')}>
                  <div className="flex items-start gap-3">
                    <Avatar name={d.name} hue={d.avatarHue} online={d.online} className="size-12 text-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-start gap-1 font-display text-lg font-bold leading-tight"><span>{d.name}</span>{d.verified && <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary-strong" aria-label="Colegiatura verificada" />}</p>
                      <p className="text-sm text-muted">{d.specialty} · {d.yearsExperience} años · <b className="font-display text-base text-foreground">{formatPEN(d.price)}</b></p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                        {d.reviews > 0 ? <span className="flex items-center gap-1"><Star className="size-3.5 fill-warning text-warning" aria-hidden /> <b>{d.rating}</b> <span className="text-muted">({d.reviews})</span></span> : <Badge tone="lavender">Nuevo</Badge>}
                        <Link to={`/medicos/${d.id}`} className="font-medium underline underline-offset-4">Ver perfil</Link>
                      </p>
                    </div>
                  </div>
                  {slots.length === 0 ? <p className="mt-3 rounded-2xl bg-surface-2 px-4 py-3 text-sm text-muted">Sin cupos este día. Prueba con otro día de la lista.</p> : <div role="radiogroup" aria-label={`Horarios de ${d.name}`} className="mt-3 flex flex-wrap gap-2">
                    {shown.map((s) => {
                      const on = mine && slot === s
                      return (
                        <button key={s} type="button" role="radio" aria-checked={on} onClick={() => setSel({ doctor: d, slot: s })}
                          className={cn('h-10 min-w-[4.5rem] rounded-full border px-3 text-sm font-medium transition active:scale-95', on ? 'border-primary-strong bg-primary text-primary-foreground' : 'border-border bg-surface-2 hover:bg-border')}>
                          {formatTime(s)}
                        </button>
                      )
                    })}
                    {slots.length > SLOTS_PREVIEW && (
                      <button type="button" onClick={() => setExpanded((p) => { const n = new Set(p); if (open) n.delete(d.id); else n.add(d.id); return n })} className="h-10 rounded-full px-3 text-sm font-medium text-muted underline-offset-4 hover:underline">
                        {open ? 'Ver menos' : `+${slots.length - SLOTS_PREVIEW} más`}
                      </button>
                    )}
                  </div>}
                </li>
              )
            })}
          </ul>
        )}
        {results.hasNextPage && <Button variant="outline" className="w-full" loading={results.isFetchingNextPage} onClick={() => results.fetchNextPage()}>Ver más profesionales</Button>}
      </section>

      <section aria-labelledby="s-why" className="space-y-3 pb-24">
        <h2 id="s-why" className="text-xl font-bold">3. Motivo <span className="text-sm font-normal text-muted">(opcional)</span></h2>
        <div className="flex flex-wrap gap-2">
          {symptoms.data?.map((s) => (
            <button key={s.id} type="button" aria-pressed={reason === s.label} onClick={() => setReason(reason === s.label ? '' : s.label)}
              className={cn('rounded-full border px-4 py-2 text-sm transition', reason === s.label ? 'border-primary-strong bg-primary-soft' : 'border-border bg-surface hover:bg-surface-2')}>{s.label}</button>
          ))}
        </div>
      </section>

      <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 px-4 pt-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1 text-sm" aria-live="polite">
            {slot && doctor ? <><p className="truncate font-semibold first-letter:uppercase">{formatLongDate(slot)} · {formatTime(slot)}</p><p className="truncate text-xs text-muted">{doctor.name} · {formatPEN(doctor.price)}</p></> : <Link to="/" className="text-muted underline-offset-4 hover:underline">Cancelar</Link>}
          </div>
          <Button size="lg" className="w-auto shrink-0" disabled={!sel} loading={book.isPending} onClick={confirm}>Confirmar cita</Button>
        </div>
      </div>
    </div>
  )
}
