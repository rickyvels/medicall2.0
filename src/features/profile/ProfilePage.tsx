import { BriefcaseMedical, ChevronRight, LogOut, Moon, RotateCcw, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import * as Switch from '@radix-ui/react-switch'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usePro, useProfile } from '@/api/hooks'
import { resetDb } from '@/api/mock/db'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { PageHeader } from '@/components/PageHeader'
import { useTheme } from '@/stores/theme'

export default function ProfilePage() {
  const { data: p, isPending, isError, refetch } = useProfile()
  const qc = useQueryClient()
  const pro = usePro()
  const { theme, setTheme } = useTheme()

  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageHeader title="Tu perfil" />
      {isPending ? <Skeleton className="h-32 rounded-card" /> : (
        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-4"><Avatar name={`${p.firstName} ${p.lastName}`} hue={165} className="size-16 text-2xl" /><div><p className="font-display text-2xl font-bold">{p.firstName} {p.lastName}</p><p className="text-sm text-muted">{p.email} · {p.phone}</p></div></div>
          <div><p className="mb-1.5 text-xs font-medium text-muted">Alergias</p><div className="flex flex-wrap gap-1.5">{p.allergies.length ? p.allergies.map((a) => <Badge key={a} tone="peach">{a}</Badge>) : <span className="text-sm text-muted">Ninguna registrada</span>}</div></div>
        </Card>
      )}

      <Link to={pro.data ? '/pro' : '/ofrece-tus-servicios'} className="flex items-center gap-4 rounded-card border border-border bg-gradient-to-br from-primary-soft to-lavender-soft p-5 shadow-soft transition hover:shadow-float">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface"><BriefcaseMedical className="size-6" aria-hidden /></div>
        <div className="min-w-0 flex-1"><p className="font-display text-lg font-bold">{pro.data ? 'Mi perfil profesional' : '¿Eres profesional de la salud?'}</p><p className="text-sm text-muted">{pro.data ? 'Gestiona tu disponibilidad y tu perfil público.' : 'Ofrece tus servicios y atiende pacientes por videollamada.'}</p></div>
        <ChevronRight className="size-5 text-muted" aria-hidden />
      </Link>

      <Card className="divide-y divide-border">
        <label className="flex cursor-pointer items-center justify-between p-4"><span className="flex items-center gap-3 font-medium"><Moon className="size-5" aria-hidden /> Modo oscuro</span>
          <Switch.Root checked={theme === 'dark'} onCheckedChange={(on) => setTheme(on ? 'dark' : 'light')} aria-label="Modo oscuro" className="relative h-7 w-12 rounded-full bg-border transition data-[state=checked]:bg-primary-strong"><Switch.Thumb className="block size-5 translate-x-1 rounded-full bg-white shadow transition data-[state=checked]:translate-x-6" /></Switch.Root>
        </label>
        <div className="flex items-center gap-3 p-4 text-sm text-muted"><ShieldCheck className="size-5 shrink-0" aria-hidden /> MediCall no reemplaza servicios de emergencia. Ante una urgencia llama al 106.</div>
        <button type="button" onClick={() => { resetDb(); qc.clear(); toast.success('Datos de demostración reiniciados'); window.location.assign('/') }} className="flex w-full items-center gap-3 p-4 text-left font-medium hover:bg-surface-2"><RotateCcw className="size-5" aria-hidden /> Reiniciar datos de demo</button>
        <button type="button" onClick={() => toast('Cerrar sesión estará disponible con el backend real')} className="flex w-full items-center gap-3 p-4 text-left font-medium hover:bg-surface-2"><LogOut className="size-5" aria-hidden /> Cerrar sesión</button>
      </Card>
    </div>
  )
}
