import * as Tabs from '@radix-ui/react-tabs'
import { CalendarPlus, ChevronRight, Clock, Video } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppointments, useCancelAppointment, useConsultations, useJoinAppointment } from '@/api/hooks'
import type { Appointment, ConsultationStatus } from '@/api/types'
import { PageHeader } from '@/components/PageHeader'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Lottie } from '@/components/ui/lottie'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { downloadIcs } from '@/lib/ics'
import { useNow } from '@/lib/useNow'
import { cn, formatDateTime, formatLongDate, formatPEN, formatTime } from '@/lib/utils'

const label: Record<ConsultationStatus, string> = { searching: 'Buscando', matched: 'Médico asignado', in_progress: 'En curso', completed: 'Completada', cancelled: 'Cancelada' }
const route = (id: string, s: ConsultationStatus) => (s === 'completed' ? `/consulta/${id}/resumen` : s === 'in_progress' ? `/consulta/${id}` : `/buscando/${id}`)

const JOIN_BEFORE_MS = 10 * 60_000

function AppointmentCard({ a, now }: { a: Appointment; now: number }) {
  const nav = useNavigate()
  const join = useJoinAppointment()
  const cancel = useCancelAppointment()
  const start = new Date(a.startsAt).getTime()
  const canJoin = start - now <= JOIN_BEFORE_MS
  const minutes = Math.max(0, Math.round((start - now) / 60_000))
  const hint = minutes < 60 ? `en ${minutes} min` : minutes < 1440 ? `en ${Math.round(minutes / 60)} h` : `en ${Math.round(minutes / 1440)} d`

  return (
    <Card className={cn('space-y-4 p-5', canJoin && 'border-primary-strong')}>
      <div className="flex items-start gap-4">
        <Avatar name={a.doctor.name} hue={a.doctor.avatarHue} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold">{a.doctor.name}</p>
          <p className="truncate text-sm text-muted">{a.doctor.specialty} · {a.reason}</p>
        </div>
        <Badge tone={canJoin ? 'mint' : 'lavender'}><Clock className="size-3" aria-hidden /> {canJoin ? 'Ahora' : hint}</Badge>
      </div>
      <div className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3">
        <p className="text-sm font-medium first-letter:uppercase">{formatLongDate(a.startsAt)}</p>
        <p className="font-display text-2xl font-bold">{formatTime(a.startsAt)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button className="flex-1" disabled={!canJoin} loading={join.isPending}
          onClick={() => join.mutate(a.id, { onSuccess: (c) => nav(`/buscando/${c.id}`), onError: (e) => toast.error(e.message) })}>
          <Video className="size-4" /> {canJoin ? 'Unirme a la consulta' : 'Disponible 10 min antes'}
        </Button>
        <Button variant="outline" size="icon" aria-label="Agregar al calendario" onClick={() => downloadIcs(a)}><CalendarPlus className="size-4" /></Button>
        <Button variant="ghost" loading={cancel.isPending} onClick={() => cancel.mutate(a.id, { onSuccess: () => toast('Cita cancelada') })}>Cancelar</Button>
      </div>
      <p className="text-xs text-muted">{formatPEN(a.price)} · se cobra al finalizar</p>
    </Card>
  )
}

export default function HistoryPage() {
  const consultations = useConsultations()
  const appointments = useAppointments()
  const now = useNow()
  const upcoming = appointments.data?.filter((a) => a.status === 'scheduled') ?? []

  return (
    <div>
      <PageHeader title="Tus consultas" subtitle="Citas, historial y recetas." action={<Button asChild size="sm"><Link to="/agendar"><CalendarPlus className="size-4" /> Agendar</Link></Button>} />
      <Tabs.Root defaultValue="upcoming">
        <Tabs.List aria-label="Consultas" className="mb-5 inline-flex rounded-full bg-surface-2 p-1">
          {[['upcoming', `Próximas${upcoming.length ? ` (${upcoming.length})` : ''}`], ['history', 'Historial']].map(([v, t]) => (
            <Tabs.Trigger key={v} value={v} className="rounded-full px-5 py-2 text-sm font-medium text-muted transition data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-soft">{t}</Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="upcoming">
          {appointments.isError ? <ErrorState onRetry={() => appointments.refetch()} /> : appointments.isPending ? (
            <Skeleton className="h-52 rounded-card" />
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center rounded-card border border-dashed border-border bg-surface/60 px-6 py-10 text-center">
              <Lottie name="calendar" className="mb-2 size-40" />
              <h2 className="text-xl font-bold">No tienes citas próximas</h2>
              <p className="mb-4 mt-1 max-w-xs text-sm text-muted">Agenda una teleconsulta para el día y la hora que mejor te quede.</p>
              <Button asChild><Link to="/agendar"><CalendarPlus className="size-4" /> Agendar teleconsulta</Link></Button>
            </div>
          ) : <ul className="space-y-4">{upcoming.map((a) => <li key={a.id}><AppointmentCard a={a} now={now} /></li>)}</ul>}
        </Tabs.Content>

        <Tabs.Content value="history">
          {consultations.isError ? <ErrorState onRetry={() => consultations.refetch()} /> : consultations.isPending ? (
            <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-20 rounded-card" />)}</div>
          ) : consultations.data.length === 0 ? (
            <div className="flex flex-col items-center rounded-card border border-dashed border-border bg-surface/60 px-6 py-10 text-center">
              <Lottie name="floaty" className="mb-2 h-36 w-48" />
              <EmptyState title="Aún no tienes consultas" description="Cuando te atiendas, verás aquí tus recetas e indicaciones." action={<Button asChild><Link to="/">Iniciar una consulta</Link></Button>} />
            </div>
          ) : (
            <ul className="space-y-3">
              {consultations.data.map((c) => (
                <li key={c.id}>
                  <Card className="transition hover:bg-surface-2/50">
                    <Link to={route(c.id, c.status)} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0"><p className="truncate font-semibold">{c.symptomLabel}</p><p className="text-xs text-muted">{c.doctor?.name ?? 'Sin asignar'} · {formatDateTime(c.createdAt)}</p></div>
                      <div className="flex items-center gap-3"><div className="text-right"><Badge tone={c.status === 'completed' ? 'mint' : 'neutral'}>{label[c.status]}</Badge><p className="mt-1 text-xs text-muted">{formatPEN(c.total)}</p></div><ChevronRight className="size-4 text-muted" aria-hidden /></div>
                    </Link>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
