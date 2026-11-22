import { Check, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useCheckIn, useClaimMission, useWellness } from '@/api/hooks'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Lottie } from '@/components/ui/lottie'
import { Orbs } from '@/components/ui/orbs'
import { DynamicIcon } from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { cn } from '@/lib/utils'

const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function WellnessPage() {
  const { data: w, isPending, isError, refetch } = useWellness()
  const claim = useClaimMission()
  const checkIn = useCheckIn()

  if (isError) return <ErrorState onRetry={() => refetch()} />
  if (isPending) return <div className="space-y-4"><Skeleton className="h-40 rounded-card" /><Skeleton className="h-56 rounded-card" /></div>

  return (
    <div className="space-y-6">
      <PageHeader title="Tu bienestar" subtitle="Pequeños hábitos, grandes recompensas." />

      <Card className="relative overflow-hidden bg-gradient-to-br from-primary-soft to-lavender-soft p-6">
        <Orbs strength={0.35} />
        <Lottie name="sparkle" className="absolute right-20 top-1 size-24" />
        <div className="relative flex items-center justify-between">
          <div><p className="text-sm text-muted">Nivel {w.level}</p><p className="font-display text-4xl font-bold">{w.levelName}</p></div>
          <div className="text-right"><p className="font-display text-3xl font-bold">{w.xp}</p><p className="text-xs text-muted">puntos Vida</p></div>
        </div>
        {w.xpForNextLevel > 0 ? (
          <div className="mt-5"><Progress value={w.xpIntoLevel} max={w.xpForNextLevel} label="Progreso al siguiente nivel" /><p className="mt-2 text-xs text-muted">{w.xpForNextLevel - w.xpIntoLevel} puntos para el siguiente nivel</p></div>
        ) : <p className="mt-4 text-sm">¡Nivel máximo alcanzado!</p>}
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="flex items-center gap-1 font-display text-xl font-bold"><Lottie name="flame" className="-ml-1 size-9" /> Racha de {w.streak} {w.streak === 1 ? 'día' : 'días'}</p>
          <Button size="sm" disabled={w.checkedInToday} loading={checkIn.isPending} onClick={() => checkIn.mutate(undefined, { onSuccess: () => toast.success('+10 puntos Vida') })}>{w.checkedInToday ? 'Hecho ✓' : 'Check-in'}</Button>
        </div>
        <ul className="grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <li key={i} className="flex flex-col items-center gap-1.5 text-xs text-muted"><span className={cn('grid size-9 place-items-center rounded-full', w.weekCheckIns[i] ? 'bg-primary text-primary-foreground' : 'bg-surface-2')}>{w.weekCheckIns[i] && <Check className="size-4" aria-label="Completado" />}</span>{d}</li>
          ))}
        </ul>
      </Card>

      <section aria-labelledby="missions">
        <h2 id="missions" className="mb-3 text-xl font-bold">Misiones de hoy</h2>
        <ul className="space-y-3">
          {w.missions.map((m) => {
            const done = m.progress >= m.target
            return (
              <li key={m.id}>
                <Card className="flex items-center gap-4 p-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-lavender-soft"><DynamicIcon name={m.icon} className="size-5" /></div>
                  <div className="min-w-0 flex-1"><p className="font-semibold">{m.title}</p><p className="mb-2 text-xs text-muted">{m.description}</p><Progress value={m.progress} max={m.target} label={m.title} /></div>
                  <Button size="sm" variant={m.claimed ? 'secondary' : 'primary'} disabled={!done || m.claimed} loading={claim.isPending && claim.variables === m.id} onClick={() => claim.mutate(m.id, { onSuccess: () => toast.success(`+${m.xp} puntos Vida`) })}>{m.claimed ? '✓' : `+${m.xp}`}</Button>
                </Card>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="badges">
        <h2 id="badges" className="mb-3 text-xl font-bold">Insignias</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {w.badges.map((b) => (
            <li key={b.id}>
              <Card className={cn('flex flex-col items-center gap-2 p-4 text-center', !b.unlocked && 'opacity-60')}>
                <div className={cn('grid size-14 place-items-center rounded-full', b.unlocked ? 'bg-peach-soft' : 'bg-surface-2')}>{b.unlocked ? <DynamicIcon name={b.icon} className="size-6" /> : <Lock className="size-5" aria-label="Bloqueada" />}</div>
                <p className="text-sm font-semibold">{b.title}</p><p className="text-xs text-muted">{b.description}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
