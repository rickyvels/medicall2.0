import { motion } from 'framer-motion'
import { Clock, Star } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useCancelConsultation, useConsultation, useStartConsultation } from '@/api/hooks'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Lottie } from '@/components/ui/lottie'
import { ErrorState } from '@/components/ui/states'
import { formatPEN } from '@/lib/utils'

export default function MatchingPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { data: c, isError, refetch } = useConsultation(id)
  const cancel = useCancelConsultation()
  const start = useStartConsultation()

  if (isError) return <ErrorState message="No encontramos esta consulta." onRetry={() => refetch()} />
  if (!c) return <div className="grid min-h-[60dvh] place-items-center text-sm text-muted" role="status">Cargando…</div>
  if (c.status === 'in_progress') return <Navigate to={`/consulta/${id}`} replace />
  if (c.status === 'completed') return <Navigate to={`/consulta/${id}/resumen`} replace />
  if (c.status === 'cancelled') return <Navigate to="/" replace />

  const onCancel = () => cancel.mutate(id, { onSuccess: () => { toast('Búsqueda cancelada'); nav('/', { replace: true }) } })

  if (c.status === 'searching') {
    return (
      <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center text-center" role="status" aria-live="polite">
        <div className="relative mb-6">
          <motion.div aria-hidden className="absolute inset-6 rounded-full bg-gradient-to-br from-primary-soft via-lavender-soft to-peach-soft blur-2xl" animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
          <Lottie name="radar" className="relative size-72" />
        </div>
        <h1 className="text-3xl font-bold">Buscando tu médico…</h1>
        <p className="mt-2 text-sm text-muted">Estamos conectándote con un profesional verificado disponible ahora para «{c.symptomLabel}».</p>
        <Button variant="ghost" className="mt-10" onClick={onCancel} loading={cancel.isPending}>Cancelar búsqueda</Button>
      </div>
    )
  }

  const d = c.doctor!
  return (
    <div className="mx-auto max-w-md space-y-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <Lottie name="sparkle" className="absolute -top-4 right-0 size-24" />
        <p className="mb-1 text-sm font-medium text-muted">¡Encontramos a tu médico!</p>
        <h1 className="text-3xl font-bold">Listo para atenderte</h1>
      </motion.div>
      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-4">
          <Avatar name={d.name} hue={d.avatarHue} className="size-16 text-2xl" />
          <div className="min-w-0">
            <p className="font-display text-xl font-bold">{d.name}</p>
            <p className="text-sm text-muted">{d.specialty} · Col. {d.cmp}</p>
            <p className="mt-1 flex items-center gap-1 text-sm"><Star className="size-4 fill-warning text-warning" aria-hidden /> <b>{d.rating}</b> <span className="text-muted">({d.reviews} reseñas)</span></p>
          </div>
        </div>
        <p className="text-sm text-muted">{d.bio}</p>
        <Link to={`/medicos/${d.id}`} className="inline-block text-sm font-medium underline underline-offset-4">Ver perfil completo</Link>
        <div className="flex items-center justify-between rounded-2xl bg-surface-2 p-4 text-sm">
          <span className="flex items-center gap-2"><Clock className="size-4" aria-hidden /> Disponible ahora</span>
          <span className="text-right">{c.discount > 0 && <span className="mr-2 text-muted line-through">{formatPEN(c.price)}</span>}<b className="font-display text-xl">{formatPEN(c.total)}</b></span>
        </div>
      </Card>
      <Button size="lg" className="w-full" loading={start.isPending} onClick={() => start.mutate(id, { onSuccess: () => nav(`/consulta/${id}`, { replace: true }) })}>Iniciar consulta</Button>
      <Button variant="ghost" className="w-full" onClick={onCancel} loading={cancel.isPending}>Cancelar</Button>
    </div>
  )
}
