import { CreditCard, Lock, Smartphone, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { useCoupons, useWallet } from '@/api/hooks'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Lottie } from '@/components/ui/lottie'
import { Orbs } from '@/components/ui/orbs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/ui/states'
import { cn, formatDateTime, formatPEN } from '@/lib/utils'

export default function WalletPage() {
  const wallet = useWallet()
  const coupons = useCoupons()

  if (wallet.isError) return <ErrorState onRetry={() => wallet.refetch()} />

  return (
    <div className="space-y-6">
      <PageHeader title="Wallet" subtitle="Saldo, métodos de pago y cupones." />

      {wallet.isPending ? <Skeleton className="h-36 rounded-card" /> : (
        <Card className="relative overflow-hidden bg-foreground p-6 text-background">
          <Orbs strength={0.25} />
          <Lottie name="sparkle" className="absolute right-3 top-2 size-28" />
          <p className="text-sm opacity-70">Saldo disponible</p>
          <p className="font-display text-5xl font-bold">{formatPEN(wallet.data.balance)}</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => toast('Recargas disponibles muy pronto')}>Recargar</Button>
        </Card>
      )}

      <section aria-labelledby="coupons">
        <h2 id="coupons" className="mb-3 text-xl font-bold">Cupones</h2>
        {coupons.isPending ? <Skeleton className="h-24 rounded-card" /> : coupons.isError ? <ErrorState onRetry={() => coupons.refetch()} /> : (
          <ul className="space-y-3">
            {coupons.data.map((c) => (
              <li key={c.id}>
                <Card className={cn('flex items-center gap-4 p-4', c.state !== 'available' && 'opacity-60')}>
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-peach-soft">{c.state === 'locked' ? <Lock className="size-5" aria-label="Bloqueado" /> : <Ticket className="size-5" aria-hidden />}</div>
                  <div className="min-w-0 flex-1"><p className="font-semibold">{c.title}</p><p className="text-xs text-muted">{c.description}</p></div>
                  {c.state === 'available' ? (
                    <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard?.writeText(c.code).catch(() => undefined); toast.success(`Código ${c.code} copiado`) }}>{c.code}</Button>
                  ) : <Badge>{c.state === 'used' ? 'Usado' : `Nivel ${c.unlockLevel}`}</Badge>}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {wallet.data && (
        <>
          <section aria-labelledby="methods">
            <h2 id="methods" className="mb-3 text-xl font-bold">Métodos de pago</h2>
            <ul className="space-y-3">
              {wallet.data.methods.map((m) => (
                <li key={m.id}><Card className="flex items-center gap-3 p-4">{m.kind === 'card' ? <CreditCard className="size-5" aria-hidden /> : <Smartphone className="size-5" aria-hidden />}<span className="font-medium">{m.label}{m.last4 && ` •••• ${m.last4}`}</span>{m.isDefault && <Badge tone="mint" className="ml-auto">Principal</Badge>}</Card></li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="tx">
            <h2 id="tx" className="mb-3 text-xl font-bold">Movimientos</h2>
            {wallet.data.transactions.length === 0 ? <EmptyState title="Sin movimientos" /> : (
              <Card className="divide-y divide-border">
                {wallet.data.transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4"><div><p className="text-sm font-medium">{t.title}</p><p className="text-xs text-muted">{formatDateTime(t.createdAt)}</p></div><p className={cn('font-semibold', t.amount > 0 && 'text-primary-strong')}>{t.amount > 0 ? '+' : ''}{formatPEN(t.amount)}</p></div>
                ))}
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  )
}
