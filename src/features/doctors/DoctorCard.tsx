import { BadgeCheck, Clock, Heart, Star } from 'lucide-react'
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
    <article className={cn('group relative flex gap-3 rounded-card border border-border bg-surface p-4 shadow-soft transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-float', className)}>
      <Link to={`/medicos/${d.id}`} className="absolute inset-0 z-0 rounded-card" aria-label={`Ver perfil de ${d.name}`} />

      {/* Avatar */}
      <Avatar name={d.name} hue={d.avatarHue} online={d.online} className="size-14 shrink-0 text-xl" />

      {/* Info */}
      <div className="min-w-0 flex-1">
        {/* Name row */}
        <h3 className="flex items-center gap-1 font-display text-base font-bold leading-tight">
          <span className="truncate">{d.name}</span>
          {d.verified && (
            <BadgeCheck className="size-4 shrink-0 text-primary-strong" aria-label="Colegiatura verificada" />
          )}
        </h3>

        {/* Specialty */}
        <p className="mt-0.5 truncate text-xs text-muted">{d.specialty} · {d.yearsExperience} años</p>

        {/* Rating + status */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
          {d.reviews > 0 ? (
            <span className="flex items-center gap-0.5 font-semibold">
              <Star className="size-3.5 fill-warning text-warning" aria-hidden />
              {d.rating}
              <span className="font-normal text-muted">({d.reviews})</span>
            </span>
          ) : (
            <Badge tone="lavender">Nuevo</Badge>
          )}
          <Badge tone={d.online ? 'mint' : 'neutral'}>{d.online ? '● En línea' : 'Fuera de línea'}</Badge>
        </div>

        {/* Price + ETA row */}
        <div className="mt-2 flex items-center gap-2">
          <span className="font-display text-sm font-bold text-foreground">{formatPEN(d.price)}</span>
          {d.online && d.etaMinutes && (
            <span className="flex items-center gap-1 text-[11px] text-muted">
              <Clock className="size-3" aria-hidden />
              ~{d.etaMinutes} min
            </span>
          )}
        </div>
      </div>

      {/* Favorite button */}
      <button
        type="button"
        aria-pressed={!!d.isFavorite}
        aria-label={d.isFavorite ? `Quitar a ${d.name} de favoritos` : `Guardar a ${d.name} en favoritos`}
        onClick={() => fav.mutate(d.id, { onSuccess: (x) => toast(x.isFavorite ? 'Guardado en favoritos' : 'Quitado de favoritos') })}
        className="relative z-10 grid size-9 shrink-0 place-items-center self-start rounded-full bg-surface-2 transition hover:bg-border active:scale-90"
      >
        <Heart className={cn('size-4 transition', d.isFavorite ? 'fill-danger text-danger scale-110' : 'scale-100')} aria-hidden />
      </button>
    </article>
  )
}

