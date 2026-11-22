import { Building2, Pill, Star, Trophy } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useConsultation, useRateConsultation } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Lottie } from '@/components/ui/lottie'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function SummaryPage() {
  const { id = '' } = useParams()
  const { data: c } = useConsultation(id)
  const rate = useRateConsultation()

  if (!c) return <div className="mx-auto max-w-xl space-y-3"><Skeleton className="h-24" /><Skeleton className="h-40" /></div>

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center gap-2">
        <Lottie name="success" loop={false} className="size-24 shrink-0" />
        <div>
          <p className="text-sm text-muted">{c.doctor?.name} · {c.symptomLabel}</p>
          <h1 className="text-3xl font-bold">Resumen de tu consulta</h1>
        </div>
      </div>

      {c.xpEarned && (
        <div className="flex items-center gap-3 rounded-card bg-lavender-soft p-4"><Trophy className="size-6" aria-hidden /><p className="text-sm"><b>+{c.xpEarned} puntos Vida</b> por cuidar de tu salud.</p></div>
      )}

      <Card className="p-5"><h2 className="mb-2 text-xl font-bold">Indicaciones</h2><p className="text-sm text-muted">{c.notes}</p></Card>

      {c.prescriptions && c.prescriptions.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Pill className="size-5" aria-hidden /> Receta digital</h2>
          <ul className="divide-y divide-border">
            {c.prescriptions.map((p) => <li key={p.medication} className="py-3"><p className="font-medium">{p.medication}</p><p className="text-sm text-muted">{p.dose} · {p.duration}</p></li>)}
          </ul>
        </Card>
      )}

      {c.referral && (
        <Card className="border-warning bg-peach-soft p-5">
          <h2 className="mb-1 flex items-center gap-2 text-xl font-bold"><Building2 className="size-5" aria-hidden /> Derivación a clínica</h2>
          <p className="mb-4 text-sm">{c.referral.reason}</p>
          <Button asChild><Link to="/clinicas">Ver clínicas aliadas</Link></Button>
        </Card>
      )}

      <Card className="p-5 text-center">
        <h2 className="mb-3 text-xl font-bold">¿Cómo fue tu atención?</h2>
        <div className="flex justify-center gap-1" role="radiogroup" aria-label="Calificación">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={c.rating === n} aria-label={`${n} estrellas`} disabled={rate.isPending || !!c.rating} onClick={() => rate.mutate({ id, rating: n }, { onSuccess: () => toast.success('¡Gracias por tu opinión!') })} className="p-1">
              <Star className={cn('size-9 transition', (c.rating ?? 0) >= n ? 'fill-warning text-warning' : 'text-border')} />
            </button>
          ))}
        </div>
      </Card>

      {c.doctor && <Button asChild size="lg" variant="outline" className="w-full"><Link to={`/agendar?doctor=${c.doctor.id}`}>Agendar seguimiento con {c.doctor.name}</Link></Button>}
      <Button asChild size="lg" className="w-full"><Link to="/">Volver al inicio</Link></Button>
    </div>
  )
}
