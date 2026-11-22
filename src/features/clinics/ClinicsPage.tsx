import { CalendarCheck, MapPin, Star } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useBookClinic, useClinics } from '@/api/hooks'
import type { Clinic } from '@/api/types'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Lottie } from '@/components/ui/lottie'
import { Sheet } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'

export default function ClinicsPage() {
  const { data, isPending, isError, refetch } = useClinics()
  const book = useBookClinic()
  const [sel, setSel] = useState<Clinic | null>(null)
  const [code, setCode] = useState<string | null>(null)

  const confirm = () => sel && book.mutate({ clinicId: sel.id }, { onSuccess: (r) => setCode(r.confirmationCode), onError: (e) => toast.error(e.message) })
  const close = () => { setSel(null); setCode(null) }

  return (
    <div>
      <PageHeader title="Clínicas aliadas" subtitle="Si necesitas atención presencial, te llevamos a la mejor opción cercana." />
      <Lottie name="pulse-line" className="-mt-2 mb-5 h-10 w-full opacity-80" />
      {isError ? <ErrorState onRetry={() => refetch()} /> : isPending ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-card" />)}</div>
      ) : data.length === 0 ? <EmptyState title="Sin clínicas cercanas" description="Amplía tu zona de búsqueda." /> : (
        <ul className="grid gap-4 md:grid-cols-2">
          {data.map((c) => (
            <li key={c.id}>
              <Card className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="text-xl font-bold">{c.name}</h2><p className="flex items-center gap-1 text-sm text-muted"><MapPin className="size-3.5" aria-hidden /> {c.district} · {c.distanceKm} km</p></div>
                  <Badge tone={c.openNow ? 'mint' : 'neutral'}>{c.openNow ? 'Abierto' : 'Cerrado'}</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">{c.specialties.map((s) => <Badge key={s}>{s}</Badge>)}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><Star className="size-4 fill-warning text-warning" aria-hidden /> {c.rating}</span>
                  <Badge tone="peach">-{Math.round(c.partnerDiscount * 100)}% con MediCall</Badge>
                </div>
                <Button className="w-full" onClick={() => setSel(c)}><CalendarCheck className="size-4" /> Agendar · {c.nextSlot}</Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <Sheet open={!!sel} onOpenChange={(o) => !o && close()} title={code ? '¡Cita confirmada!' : 'Confirmar cita'} description={sel?.name}>
        {code ? (
          <div className="space-y-4 text-center"><p className="text-sm text-muted">Presenta este código en recepción:</p><p className="font-display text-4xl font-bold tracking-widest">{code}</p><Button className="w-full" onClick={close}>Listo</Button></div>
        ) : (
          <div className="space-y-4"><p className="text-sm text-muted">{sel?.name} · {sel?.nextSlot}. Compartiremos con la clínica el resumen de tu teleconsulta si lo tienes.</p><Button size="lg" className="w-full" loading={book.isPending} onClick={confirm}>Confirmar cita</Button></div>
        )}
      </Sheet>
    </div>
  )
}
