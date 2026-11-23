import { ArrowUp, CalendarClock, CalendarPlus, ChevronRight, Clock, Gift, ShieldCheck, Sparkles, Star, Video, Activity, Pill } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAppointments, useCheckIn, useConsultations, useDoctors, useProfile, usePromos, useSymptoms, useWellness } from '@/api/hooks'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { DoctorCard } from '@/features/doctors/DoctorCard'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { DynamicIcon } from '@/components/ui/icon'
import { Lottie } from '@/components/ui/lottie'
import { Reveal } from '@/components/ui/reveal'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { cn, formatLongDate, formatTime } from '@/lib/utils'

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

const toneCls = { mint: 'bg-primary-soft', lavender: 'bg-lavender-soft', peach: 'bg-peach-soft' } as const

/** Quick-action buttons (tipo iPhone Health / Duolingo) */
const quickActions = [
  { icon: Video, label: 'Consultar', sublabel: 'ahora', to: '/triaje/other', color: 'bg-primary text-primary-foreground', glow: 'shadow-[0_4px_24px_-4px_hsl(var(--tw-shadow-color))] shadow-primary/60' },
  { icon: CalendarPlus, label: 'Agendar', sublabel: 'cita', to: '/agendar', color: 'bg-lavender-soft text-foreground', glow: '' },
  { icon: Activity, label: 'Bienestar', sublabel: 'y racha', to: '/bienestar', color: 'bg-peach-soft text-foreground', glow: '' },
  { icon: Pill, label: 'Wallet', sublabel: 'y recetas', to: '/wallet', color: 'bg-surface-2 text-foreground', glow: '' },
]

export default function HomePage() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const { data: profile } = useProfile()
  const symptoms = useSymptoms()
  const promos = usePromos()
  const wellness = useWellness()
  const consultations = useConsultations()
  const checkIn = useCheckIn()
  const online = useDoctors({ onlineOnly: true, sort: 'rating' })
  const top = online.data?.[0]
  const featured = useDoctors({ sort: 'rating' })
  const appointments = useAppointments()
  const nextAppt = appointments.data?.find((a) => a.status === 'scheduled')

  const active = useMemo(() => consultations.data?.find((c) => ['searching', 'matched', 'in_progress'].includes(c.status)), [consultations.data])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const term = q.trim().toLowerCase()
    const match = symptoms.data?.find((s) => term && (s.label.toLowerCase().includes(term) || s.hint.toLowerCase().includes(term)))
    nav(`/triaje/${match?.id ?? 'other'}`)
  }

  return (
    <div className="space-y-8">
      {/* ── Greeting ── */}
      <div className="flex items-start justify-between">
        <div>
          <PageHeader
            title={`${greeting()}${profile ? `, ${profile.firstName}` : ''} 👋`}
            subtitle="¿Cómo te sientes hoy?"
          />
        </div>
        {wellness.data && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden shrink-0 items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 shadow-soft sm:flex"
          >
            <Lottie name="flame" className="size-8" />
            <div className="text-right">
              <p className="text-xs font-bold">{wellness.data.streak} días</p>
              <p className="text-[10px] text-muted">de racha</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Active consultation banner ── */}
      {active && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to={active.status === 'in_progress' ? `/consulta/${active.id}` : `/buscando/${active.id}`}
            className="flex items-center justify-between rounded-card bg-foreground p-4 text-background"
          >
            <div>
              <p className="text-xs opacity-70">Consulta en curso</p>
              <p className="font-medium">{active.symptomLabel}</p>
            </div>
            <span className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Continuar</span>
          </Link>
        </motion.div>
      )}

      {/* ── Quick actions grid ── */}
      <section aria-label="Accesos rápidos">
        <ul className="grid grid-cols-4 gap-3">
          {quickActions.map((a, i) => (
            <motion.li
              key={a.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={a.to}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span className={cn('grid size-14 place-items-center rounded-2xl transition group-hover:scale-105 group-active:scale-95', a.color, a.glow)}>
                  <a.icon className="size-6" aria-hidden />
                </span>
                <span className="text-xs font-semibold leading-tight">{a.label}</span>
                <span className="text-[10px] text-muted leading-none">{a.sublabel}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* ── Próxima cita (prominent) ── */}
      {nextAppt && (
        <Reveal>
          <Link
            to="/consultas"
            className="group flex items-center gap-4 rounded-card border border-primary/30 bg-gradient-to-r from-primary-soft to-lavender-soft p-4 shadow-soft transition hover:shadow-float"
          >
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface shadow-soft">
              <CalendarClock className="size-7 text-primary-foreground" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted">Tu próxima cita</p>
              <p className="truncate font-display text-base font-bold first-letter:uppercase">
                {formatLongDate(nextAppt.startsAt)} · {formatTime(nextAppt.startsAt)}
              </p>
              <p className="truncate text-xs text-muted">{nextAppt.doctor.name}</p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted transition group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </Reveal>
      )}

      {/* ── AI search bar ── */}
      <form
        onSubmit={submit}
        className="mx-auto flex max-w-2xl items-center gap-2 rounded-full border border-border bg-surface p-2 pl-5 shadow-soft focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/20"
      >
        <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Describe cómo te sientes"
          placeholder="Me duele la cabeza desde ayer…"
          className="h-10 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted/60"
        />
        <button
          type="submit"
          aria-label="Comenzar"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary-strong active:scale-95"
        >
          <ArrowUp className="size-4" />
        </button>
      </form>

      {/* ── Hero section ── */}
      <Reveal>
        <section
          aria-label="Atención inmediata"
          className="relative isolate flex min-h-[22rem] flex-col justify-between gap-8 overflow-hidden rounded-sheet border border-border p-6 text-white shadow-float sm:min-h-[24rem] sm:p-8"
        >
          <img
            src="/images/hero-doctors.jpg"
            alt=""
            width={678}
            height={452}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 -z-20 size-full object-cover object-[72%_35%]"
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b2f29]/90 via-[#0f3d36]/65 to-[#0f3d36]/5 sm:via-[#0f3d36]/40" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-[#0b2f29]/70 to-transparent" />

          <div className="max-w-md">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 py-1 pl-1 pr-3 text-xs font-medium backdrop-blur-md">
              <span className="flex -space-x-2">
                {online.data?.slice(0, 3).map((d) => (
                  <Avatar key={d.id} name={d.name} hue={d.avatarHue} className="size-6 border-2 border-white/80 text-[9px]" />
                ))}
              </span>
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {online.data
                ? `${online.data.length} ${online.data.length === 1 ? 'médico' : 'médicos'} en línea`
                : 'Conectando…'}
            </div>
            <h2 className="font-display text-3xl font-bold leading-[1.1] sm:text-4xl">
              Tu médico, a un toque de distancia
            </h2>
            <p className="mt-3 max-w-sm text-sm text-white/85">
              Teleconsulta en minutos o agenda cuando te quede mejor.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild><Link to="/triaje/other"><Video className="size-4" /> Consultar ahora</Link></Button>
              <Button asChild variant="outline" className="border-white/40 bg-white/15 text-white backdrop-blur-md hover:bg-white/25">
                <Link to="/agendar"><CalendarPlus className="size-4" /> Agendar</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            {top ? (
              <Link
                to={`/medicos/${top.id}`}
                className="group flex max-w-sm items-center gap-3 rounded-2xl border border-white/30 bg-white/90 p-3 pr-4 text-foreground shadow-float backdrop-blur-xl transition hover:bg-white dark:bg-surface/85"
              >
                <Avatar name={top.name} hue={top.avatarHue} online className="size-12" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-muted">Disponible ahora · ~{top.etaMinutes} min</p>
                  <p className="truncate font-display text-base font-bold">{top.name}</p>
                  <p className="flex items-center gap-1 text-xs">
                    <Star className="size-3 fill-warning text-warning" aria-hidden /> {top.rating} · {top.specialty}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
            ) : (
              <Skeleton className="h-[76px] w-72 rounded-2xl bg-white/20" />
            )}
            <ul className="flex gap-2 text-xs font-medium" aria-label="Garantías">
              {([[ShieldCheck, 'Colegiatura verificada'], [Clock, 'Respuesta en minutos']] as const).map(([Icon, text]) => (
                <li key={text} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-md">
                  <Icon className="size-3.5" aria-hidden /> {text}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Reveal>

      {/* ── Síntomas frecuentes ── */}
      <section aria-labelledby="sym">
        <h2 id="sym" className="mb-4 text-xl font-bold">Motivos frecuentes</h2>
        {symptoms.isError ? (
          <ErrorState onRetry={() => symptoms.refetch()} />
        ) : (
          <ul className="grid grid-cols-4 gap-x-2 gap-y-5 sm:grid-cols-8">
            {symptoms.isPending
              ? Array.from({ length: 8 }).map((_, i) => (
                  <li key={i}><Skeleton className="mx-auto size-14 rounded-2xl" /></li>
                ))
              : symptoms.data.map((s, i) => (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link to={`/triaje/${s.id}`} className="group flex flex-col items-center gap-2 text-center">
                      <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 transition group-hover:bg-primary-soft group-active:scale-95">
                        <DynamicIcon name={s.icon} className="size-6" />
                      </span>
                      <span className="text-xs font-medium leading-tight">{s.label}</span>
                    </Link>
                  </motion.li>
                ))}
          </ul>
        )}
      </section>

      {/* ── Médicos destacados ── */}
      <section aria-labelledby="featured">
        <div className="mb-4 flex items-end justify-between">
          <h2 id="featured" className="text-xl font-bold">Médicos destacados</h2>
          <Link to="/medicos" className="text-sm font-medium text-primary-foreground underline underline-offset-4">
            Ver todos
          </Link>
        </div>
        {featured.isError ? (
          <ErrorState onRetry={() => featured.refetch()} />
        ) : (
          <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {featured.isPending
              ? Array.from({ length: 3 }).map((_, i) => (
                  <li key={i}><Skeleton className="h-32 w-80 shrink-0 rounded-card" /></li>
                ))
              : featured.data.slice(0, 6).map((d) => (
                  <li key={d.id} className="w-80 shrink-0 snap-start">
                    <DoctorCard doctor={d} />
                  </li>
                ))}
          </ul>
        )}
      </section>

      {/* ── Promociones "Para ti" ── */}
      <section aria-labelledby="promos">
        <h2 id="promos" className="mb-4 text-xl font-bold">Para ti</h2>
        <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {promos.isPending
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-36 w-72 shrink-0 rounded-card" />
              ))
            : promos.data?.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn('relative flex h-36 w-72 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-card p-5', toneCls[p.tone])}
                >
                  <div>
                    <Gift className="mb-2 size-5" aria-hidden />
                    <Lottie name="sparkle" className="absolute right-2 top-2 size-14 opacity-80" />
                    <p className="font-display text-xl font-bold leading-tight">{p.title}</p>
                    <p className="text-xs text-muted">{p.subtitle}</p>
                  </div>
                  <Link to="/wallet" className="self-start rounded-full bg-surface px-3 py-1 text-xs font-semibold transition hover:bg-surface-2">
                    {p.cta}
                  </Link>
                </motion.div>
              ))}
        </div>
      </section>

      {/* ── Check-in streak card ── */}
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-peach-soft">
            <Lottie name="flame" className="size-11" />
          </div>
          <div>
            <p className="font-display text-xl font-bold">
              {wellness.data ? `Racha de ${wellness.data.streak} días` : 'Tu racha'}
            </p>
            <p className="text-sm text-muted">Check-in diario: +10 puntos Vida</p>
            {wellness.data && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-primary-strong transition-all"
                    style={{ width: `${Math.min((wellness.data.xpIntoLevel / (wellness.data.xpForNextLevel || 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-muted">{wellness.data.xp} pts Vida</span>
              </div>
            )}
          </div>
        </div>
        <Button
          variant={wellness.data?.checkedInToday ? 'secondary' : 'primary'}
          disabled={!wellness.data || wellness.data.checkedInToday}
          loading={checkIn.isPending}
          onClick={() => checkIn.mutate(undefined, { onSuccess: () => toast.success('¡Check-in listo! +10 puntos Vida') })}
        >
          {wellness.data?.checkedInToday ? 'Listo por hoy ✓' : 'Hacer check-in'}
        </Button>
      </Card>
    </div>
  )
}

