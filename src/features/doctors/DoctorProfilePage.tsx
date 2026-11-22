import { ArrowLeft, BadgeCheck, CalendarPlus, Clock, GraduationCap, Heart, Languages, Video } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useDoctor, useDoctorReviews, useToggleFavorite } from '@/api/hooks'
import type { Availability, DoctorReviews } from '@/api/types'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { Stars } from '@/components/ui/stars'
import { cn, formatPEN } from '@/lib/utils'

const WEEK = [['L', 1], ['M', 2], ['X', 3], ['J', 4], ['V', 5], ['S', 6], ['D', 0]] as const
const hour = (h: number) => `${String(h).padStart(2, '0')}:00`
const dateFmt = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })

function Schedule({ a }: { a: Availability }) {
  return (
    <div>
      <ul className="mb-3 flex gap-2" aria-label="Días de atención">
        {WEEK.map(([label, d]) => {
          const on = a.days.includes(d)
          return <li key={d} aria-label={`${label}: ${on ? 'atiende' : 'no atiende'}`} className={cn('grid size-10 place-items-center rounded-full text-sm font-medium', on ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted')}>{label}</li>
        })}
      </ul>
      <p className="flex items-center gap-2 text-sm text-muted"><Clock className="size-4" aria-hidden /> {hour(a.startHour)} – {hour(a.endHour)} (hora de Lima)</p>
    </div>
  )
}

function Reviews({ data }: { data: DoctorReviews }) {
  if (data.total === 0) return <p className="rounded-2xl bg-surface-2 p-4 text-sm text-muted">Este profesional es nuevo en MediCall y aún no tiene reseñas. Las reseñas solo pueden dejarlas pacientes que se atendieron.</p>
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-5">
        <div className="text-center"><p className="font-display text-5xl font-bold">{data.average.toFixed(1)}</p><Stars value={data.average} /><p className="mt-1 text-xs text-muted">{data.total} reseñas</p></div>
        <ul className="flex-1 space-y-1.5" aria-label="Distribución de calificaciones">
          {([5, 4, 3, 2, 1] as const).map((n) => (
            <li key={n} className="flex items-center gap-2 text-xs"><span className="w-3 text-right">{n}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full bg-warning" style={{ width: `${(data.distribution[n] / data.total) * 100}%` }} /></span>
              <span className="w-9 text-right text-muted">{data.distribution[n]}</span></li>
          ))}
        </ul>
      </div>
      <ul className="space-y-3">
        {data.items.map((r) => (
          <li key={r.id} className="rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold">{r.author}</p><Stars value={r.rating} className="[&_svg]:size-3.5" /></div>
            <p className="mt-1.5 text-sm text-muted">{r.comment}</p>
            <p className="mt-2 text-xs text-muted/80">{dateFmt.format(new Date(r.date))} · Paciente verificado</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function DoctorProfilePage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const doctor = useDoctor(id)
  const reviews = useDoctorReviews(id)
  const fav = useToggleFavorite()
  const d = doctor.data

  if (doctor.isError) return <div className="mx-auto max-w-xl pt-10"><ErrorState message="No encontramos a este profesional." onRetry={() => doctor.refetch()} /></div>
  if (!d) return <div className="mx-auto max-w-2xl space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-40 rounded-card" /><Skeleton className="h-60 rounded-card" /></div>

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Volver" onClick={() => nav(-1)} className="grid size-10 place-items-center rounded-full bg-surface-2 hover:bg-border"><ArrowLeft className="size-4" /></button>
        <button type="button" aria-pressed={!!d.isFavorite} aria-label={d.isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          onClick={() => fav.mutate(d.id, { onSuccess: (x) => toast(x.isFavorite ? 'Guardado en favoritos' : 'Quitado de favoritos') })}
          className="grid size-10 place-items-center rounded-full bg-surface-2 hover:bg-border active:scale-90"><Heart className={cn('size-4', d.isFavorite && 'fill-danger text-danger')} aria-hidden /></button>
      </div>

      <header className="flex items-start gap-4">
        <Avatar name={d.name} hue={d.avatarHue} online={d.online} className="size-20 text-3xl" />
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-x-2 text-3xl font-bold leading-tight">{d.name}{d.verified && <BadgeCheck className="size-6 text-primary-strong" aria-label="Colegiatura verificada" />}</h1>
          <p className="text-muted">{d.specialty}</p>
          <p className="mt-1 text-xs text-muted">Colegiatura {d.cmp}{d.verified ? ' · verificada por MediCall' : ''}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone={d.online ? 'mint' : 'neutral'}>{d.online ? 'En línea ahora' : 'Fuera de línea'}</Badge>
            {d.reviews === 0 && <Badge tone="lavender">Nuevo</Badge>}
          </div>
        </div>
      </header>

      <dl className="grid grid-cols-3 gap-3 text-center">
        {[[d.reviews > 0 ? `${d.rating} ★` : '—', 'Calificación'], [`${d.yearsExperience} años`, 'Experiencia'], [d.reviews > 0 ? String(d.reviews) : '0', 'Reseñas']].map(([v, l]) => (
          <Card key={l} className="p-3"><dd className="font-display text-xl font-bold">{v}</dd><dt className="text-xs text-muted">{l}</dt></Card>
        ))}
      </dl>

      <section aria-labelledby="about"><h2 id="about" className="mb-2 text-xl font-bold">Sobre mí</h2><p className="text-sm leading-relaxed text-muted">{d.bio}</p>
        <p className="mt-3 flex items-center gap-2 text-sm"><Languages className="size-4 text-muted" aria-hidden /> {d.languages.join(' · ')}</p></section>

      <section aria-labelledby="services"><h2 id="services" className="mb-3 text-xl font-bold">Servicios y tarifas</h2>
        <Card className="divide-y divide-border">
          {d.services.map((s) => <div key={s.id} className="flex items-center justify-between p-4"><div><p className="font-medium">{s.name}</p><p className="text-xs text-muted">{s.durationMin} min · videollamada</p></div><p className="font-display text-xl font-bold">{formatPEN(s.price)}</p></div>)}
        </Card></section>

      {d.education.length > 0 && (
        <section aria-labelledby="edu"><h2 id="edu" className="mb-3 text-xl font-bold">Formación</h2>
          <ul className="space-y-2">{d.education.map((e) => <li key={e} className="flex items-start gap-3 text-sm"><GraduationCap className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden /> {e}</li>)}</ul></section>
      )}

      <section aria-labelledby="hours"><h2 id="hours" className="mb-3 text-xl font-bold">Horario de atención</h2><Schedule a={d.availability} /></section>

      <section aria-labelledby="reviews"><h2 id="reviews" className="mb-3 text-xl font-bold">Reseñas de pacientes</h2>
        {reviews.isPending ? <Skeleton className="h-40 rounded-card" /> : reviews.isError ? <ErrorState onRetry={() => reviews.refetch()} /> : <Reviews data={reviews.data} />}</section>

      <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 px-4 pt-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="hidden min-w-0 flex-1 sm:block"><p className="text-xs text-muted">Teleconsulta desde</p><p className="font-display text-2xl font-bold">{formatPEN(d.price)}</p></div>
          <Button asChild variant="outline" size="lg" className="flex-1 sm:flex-none"><Link to={`/agendar?doctor=${d.id}`}><CalendarPlus className="size-4" /> Agendar</Link></Button>
          <Button asChild size="lg" disabled={!d.online} className={cn('flex-1 sm:flex-none', !d.online && 'pointer-events-none opacity-50')}>
            <Link to={`/triaje/other?doctor=${d.id}`} aria-disabled={!d.online} tabIndex={d.online ? 0 : -1}><Video className="size-4" /> {d.online ? 'Consultar ahora' : 'No disponible ahora'}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
