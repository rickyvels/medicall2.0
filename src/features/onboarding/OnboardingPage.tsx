import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { useCompleteOnboarding } from '@/api/hooks'
import { Logo } from '@/components/layout/Logo'
import { Lottie } from '@/components/ui/lottie'
import { Orbs } from '@/components/ui/orbs'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/input'

const schema = z.object({
  firstName: z.string().trim().min(2, 'Ingresa tu nombre'),
  lastName: z.string().trim().min(2, 'Ingresa tu apellido'),
  phone: z.string().trim().regex(/^(\+51)?\s?9\d{2}\s?\d{3}\s?\d{3}$/, 'Ingresa un celular peruano válido (9XX XXX XXX)'),
  birthDate: z.string().min(1, 'Ingresa tu fecha de nacimiento'),
  allergies: z.string().optional(),
  consent: z.boolean().refine((v) => v, 'Debes aceptar para continuar'),
})
type Values = z.infer<typeof schema>

export default function OnboardingPage() {
  const nav = useNavigate()
  const complete = useCompleteOnboarding()
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { consent: false } })

  const onSubmit = (v: Values) =>
    complete.mutate(
      { firstName: v.firstName, lastName: v.lastName, phone: v.phone, birthDate: v.birthDate, allergies: v.allergies?.split(',').map((a) => a.trim()).filter(Boolean) ?? [] },
      { onSuccess: () => { toast.success('¡Bienvenida! +20 puntos Vida'); nav('/', { replace: true }) } },
    )

  return (
    <div className="relative isolate mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
      <Orbs className="fixed -z-10 opacity-60" />
      <Logo className="mb-2" />
      <Lottie name="heartbeat" className="mx-auto -my-4 size-56" />
      <h1 className="text-4xl font-bold leading-tight">Un médico en minutos, desde tu bolsillo</h1>
      <p className="mb-8 mt-2 text-sm text-muted">Cuéntanos lo básico para atenderte mejor. Tus datos de salud son privados.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" autoComplete="given-name" error={errors.firstName?.message} {...register('firstName')} />
          <Field label="Apellido" autoComplete="family-name" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <Field label="Celular" type="tel" inputMode="tel" autoComplete="tel" placeholder="987 654 321" error={errors.phone?.message} {...register('phone')} />
        <Field label="Fecha de nacimiento" type="date" error={errors.birthDate?.message} {...register('birthDate')} />
        <Field label="Alergias (opcional)" placeholder="Penicilina, polvo…" {...register('allergies')} />
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-0.5 size-5 accent-[var(--primary-strong)]" {...register('consent')} />
          <span>Acepto el consentimiento informado de telesalud y el tratamiento de mis datos personales.</span>
        </label>
        {errors.consent && <p role="alert" className="text-sm text-danger-foreground dark:text-danger">{errors.consent.message}</p>}
        <Button type="submit" size="lg" className="w-full" loading={complete.isPending}>Comenzar</Button>
      </form>
    </div>
  )
}
