import { AlertOctagon, Building2, CheckCircle2, Phone, Tag, Video } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useDoctor, useRequestConsultation, useValidateCoupon } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/input'
import { cn, formatPEN } from '@/lib/utils'
import { useFlow } from '@/stores/triage'

const tone = {
  low: 'bg-primary-soft', medium: 'bg-lavender-soft', high: 'bg-peach-soft', emergency: 'bg-danger/25',
} as const

export default function ResultPage() {
  const nav = useNavigate()
  const { result, symptomId, couponCode, doctorId, setCoupon, reset } = useFlow()
  const chosen = useDoctor(doctorId ?? '')
  const doctor = doctorId ? chosen.data : undefined
  const request = useRequestConsultation()
  const validate = useValidateCoupon()
  const [code, setCode] = useState('')
  const [percent, setPercent] = useState(0)
  const [couponError, setCouponError] = useState<string>()

  if (!result || !symptomId) return <Navigate to="/" replace />
  const emergency = result.urgency === 'emergency'
  const base = doctor?.price ?? 35
  const total = base * (1 - percent)

  const applyCoupon = () => {
    setCouponError(undefined)
    validate.mutate(code, {
      onSuccess: (c) => { setCoupon(c.code); setPercent(c.percent); toast.success(`Cupón aplicado: ${Math.round(c.percent * 100)}% de descuento`) },
      onError: (e) => { setCoupon(null); setPercent(0); setCouponError(e.message) },
    })
  }

  const go = () =>
    request.mutate({ symptomId, urgency: result.urgency, couponCode: couponCode ?? undefined, doctorId: doctorId ?? undefined }, {
      onSuccess: (c) => nav(`/buscando/${c.id}`, { replace: true }),
      onError: (e) => toast.error(e.message),
    })

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className={cn('rounded-card p-6', tone[result.urgency])}>
        {emergency ? <AlertOctagon className="mb-3 size-8" aria-hidden /> : <CheckCircle2 className="mb-3 size-8" aria-hidden />}
        <h1 className="text-3xl font-bold">{result.title}</h1>
        <p className="mt-2 text-sm">{result.advice}</p>
      </div>

      {emergency ? (
        <div className="space-y-3">
          <Button asChild size="lg" variant="danger" className="w-full"><a href="tel:106"><Phone className="size-4" /> Llamar al 106 (SAMU)</a></Button>
          <Button asChild size="lg" variant="outline" className="w-full"><Link to="/clinicas"><Building2 className="size-4" /> Ver clínicas cercanas</Link></Button>
        </div>
      ) : (
        <>
          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-2xl bg-primary-soft"><Video className="size-5" aria-hidden /></div><div><p className="font-semibold">Teleconsulta</p><p className="text-xs text-muted">{doctor ? `Con ${doctor.name}` : 'Médico en ~5 min'}</p></div></div>
              <div className="text-right">{percent > 0 && <p className="text-xs text-muted line-through">{formatPEN(base)}</p>}<p className="font-display text-2xl font-bold">{formatPEN(total)}</p></div>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1"><Field label="¿Tienes un cupón?" placeholder="BIENVENIDA20" value={code} onChange={(e) => setCode(e.target.value)} error={couponError} autoCapitalize="characters" /></div>
              <Button variant="secondary" className="mb-0.5" disabled={!code.trim()} loading={validate.isPending} onClick={applyCoupon}><Tag className="size-4" /> Aplicar</Button>
            </div>
          </Card>
          <Button size="lg" className="w-full" loading={request.isPending} onClick={go}>Buscar médico ahora</Button>
          {result.recommendedPath === 'clinic' && <Button asChild size="lg" variant="outline" className="w-full"><Link to="/clinicas"><Building2 className="size-4" /> Prefiero ir a una clínica</Link></Button>}
        </>
      )}
      <button type="button" onClick={() => { reset(); nav('/') }} className="mx-auto block text-sm text-muted underline-offset-4 hover:underline">Volver al inicio</button>
    </div>
  )
}
