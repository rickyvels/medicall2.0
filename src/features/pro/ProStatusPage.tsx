import * as Switch from '@radix-ui/react-switch'
import { ExternalLink } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { usePro, useSetOnline } from '@/api/hooks'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Lottie } from '@/components/ui/lottie'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { formatPEN } from '@/lib/utils'

export default function ProStatusPage() {
  const pro = usePro()
  const setOnline = useSetOnline()

  if (pro.isError) return <ErrorState onRetry={() => pro.refetch()} />
  if (pro.isPending) return <div className="space-y-3"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-56 rounded-card" /></div>
  if (!pro.data) return <Navigate to="/ofrece-tus-servicios" replace />

  const { doctor: d, verification, online } = pro.data
  const pending = verification === 'pending'

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageHeader title="Mi perfil profesional" subtitle="Así te ven los pacientes en MediCall." />

      <Card className="flex flex-col items-center gap-2 p-6 text-center" role="status" aria-live="polite">
        <Lottie name={pending ? 'radar' : 'success'} loop={pending} className="size-40" />
        {pending ? (
          <>
            <Badge tone="lavender">En revisión</Badge>
            <h2 className="text-2xl font-bold">Estamos verificando tu colegiatura</h2>
            <p className="max-w-sm text-sm text-muted">Confirmamos tu número de colegiatura y tu especialidad. Te avisaremos apenas termine; normalmente tarda pocos minutos.</p>
          </>
        ) : (
          <>
            <Badge tone="mint">Perfil verificado</Badge>
            <h2 className="text-2xl font-bold">Ya eres visible para los pacientes</h2>
            <p className="max-w-sm text-sm text-muted">Actívate como "Disponible ahora" para recibir consultas inmediatas, o deja que te agenden en tu horario.</p>
          </>
        )}
      </Card>

      <Card className="flex items-center justify-between gap-4 p-5">
        <label htmlFor="online" className="min-w-0 flex-1">
          <p className="font-semibold">Disponible ahora</p>
          <p className="text-xs text-muted">{pending ? 'Se habilita al verificar tu perfil.' : online ? 'Recibes consultas inmediatas.' : 'Solo recibes citas agendadas.'}</p>
        </label>
        <Switch.Root id="online" checked={online} disabled={pending} aria-label="Disponible ahora"
          onCheckedChange={(v) => setOnline.mutate(v, { onSuccess: () => toast.success(v ? 'Estás en línea' : 'Estás fuera de línea'), onError: (e) => toast.error(e.message) })}
          className="relative h-7 w-12 shrink-0 rounded-full bg-border transition data-[state=checked]:bg-primary-strong data-[disabled]:opacity-50">
          <Switch.Thumb className="block size-5 translate-x-1 rounded-full bg-white shadow transition data-[state=checked]:translate-x-6" />
        </Switch.Root>
      </Card>

      <Card className="space-y-1 p-5 text-sm">
        <p className="font-display text-xl font-bold">{d.name}</p>
        <p className="text-muted">{d.specialty} · Colegiatura {d.cmp} · {formatPEN(d.price)} por teleconsulta</p>
      </Card>

      <Button asChild size="lg" variant="outline" className="w-full" disabled={pending}>
        <Link to={`/medicos/${d.id}`} className={pending ? 'pointer-events-none opacity-50' : ''} aria-disabled={pending}><ExternalLink className="size-4" /> Ver mi perfil público</Link>
      </Button>
    </div>
  )
}
