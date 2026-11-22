import { BadgeCheck, Heart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useToggleFavorite } from '@/api/hooks'
import type { Doctor } from '@/api/types'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn, formatPEN } from '@/lib/utils'

/** Tarjeta de profesional. Toda la tarjeta lleva al perfil; el corazón guarda como favorito. */
export function DoctorCard({ doctor: d, className }: { doctor: Doctor; className?: string }) {
  const fav = useToggleFavorite()
  return (
    <article className={cn('relative flex gap-4 rounded-card border border-border bg-surface p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-float', className)}>
      <Link to={`/medicos/${d.id}`} className="absolute inset-0 z-0 rounded-card" aria-label={`Ver perfil de ${d.name}`} />
      <Avatar name={d.name} hue={d.avatarHue} online={d.online} className="size-14 text-xl" />
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-1 font-display text-lg font-bold leading-tight">
          <span className="truncate">{d.name}</span>
          {d.verified && <BadgeCheck className="size-4 shrink-0 text-primary-strong" aria-label="Colegiatura verificada" />}
        </h3>
        <p className="truncate text-sm text-muted">{d.specialty} · {d.yearsExperience} años</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
          {d.reviews > 0 ? (
            <span className="flex items-center gap-1"><Star className="size-3.5 fill-warning text-warning" aria-hidden /> <b>{d.rating}</b> <span className="text-muted">({d.reviews})</span></span>
          ) : <Badge tone="lavender">Nuevo</Badge>}
          <Badge tone={d.online ? 'mint' : 'neutral'}>{d.online ? 'En línea' : 'Fuera de línea'}</Badge>
        </div>
        <p className="mt-2 text-sm"><span className="text-muted">Desde</span> <b className="font-display text-base">{formatPEN(d.price)}</b></p>
      </div>
      <button
        type="button"
        aria-pressed={!!d.isFavorite}
        aria-label={d.isFavorite ? `Quitar a ${d.name} de favoritos` : `Guardar a ${d.name} en favoritos`}
        onClick={() => fav.mutate(d.id, { onSuccess: (x) => toast(x.isFavorite ? 'Guardado en favoritos' : 'Quitado de favoritos') })}
        className="relative z-10 grid size-9 shrink-0 place-items-center self-start rounded-full bg-surface-2 transition hover:bg-border active:scale-90"
      >
        <Heart className={cn('size-4', d.isFavorite && 'fill-danger text-danger')} aria-hidden />
      </button>
    </article>
  )
}
