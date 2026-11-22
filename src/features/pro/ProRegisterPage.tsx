import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import { useProfile, useRegisterPro } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Field, SelectField, TextareaField } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const SPECIALTIES = ['Medicina general', 'Medicina interna', 'Pediatría', 'Dermatología', 'Psicología clínica', 'Ginecología', 'Cardiología', 'Nutrición', 'Traumatología', 'Otra']
const LANGUAGES = ['Español', 'Inglés', 'Quechua', 'Portugués']
const WEEK = [['Lun', 1], ['Mar', 2], ['Mié', 3], ['Jue', 4], ['Vie', 5], ['Sáb', 6], ['Dom', 0]] as const
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 06–23

const num = (msg: string) => z.number({ error: msg })

const schema = z.object({
  title: z.enum(['Dr.', 'Dra.', 'Lic.']),
  specialty: z.string().min(1, 'Elige tu especialidad'),
  cmp: z.string().trim().regex(/^\d{4,6}$/, 'Ingresa tu número de colegiatura (4 a 6 dígitos)'),
  yearsExperience: num('Ingresa tus años de experiencia').int().min(0, 'No puede ser negativo').max(60, 'Revisa este valor'),
  price: num('Ingresa tu tarifa').min(15, 'Mínimo S/ 15').max(400, 'Máximo S/ 400'),
  bio: z.string().trim().min(40, 'Cuéntales un poco más (mínimo 40 caracteres)').max(500, 'Máximo 500 caracteres'),
  languages: z.array(z.string()).min(1, 'Elige al menos un idioma'),
  education: z.string().optional(),
  days: z.array(z.number()).min(1, 'Elige al menos un día'),
  startHour: z.number(),
  endHour: z.number(),
  consent: z.boolean().refine((v) => v, 'Debes aceptar para continuar'),
}).refine((v) => v.endHour > v.startHour, { path: ['endHour'], message: 'Debe terminar después de la hora de inicio' })
type Values = z.infer<typeof schema>

const chip = (on: boolean) => cn('rounded-full border px-4 py-2 text-sm font-medium transition active:scale-95', on ? 'border-primary-strong bg-primary text-primary-foreground' : 'border-border bg-surface hover:bg-surface-2')

export default function ProRegisterPage() {
  const nav = useNavigate()
  const profile = useProfile()
  const register = useRegisterPro()
  const { register: reg, handleSubmit, control, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: 'Dr.', specialty: '', languages: ['Español'], days: [1, 2, 3, 4, 5], startHour: 9, endHour: 18, consent: false, education: '' },
  })

  const onSubmit = (v: Values) =>
    register.mutate({
      title: v.title, specialty: v.specialty, cmp: v.cmp, yearsExperience: v.yearsExperience, bio: v.bio, price: v.price,
      languages: v.languages, education: (v.education ?? '').split('\n').map((l) => l.trim()).filter(Boolean),
      availability: { days: v.days, startHour: v.startHour, endHour: v.endHour },
    }, { onSuccess: () => { toast.success('¡Perfil enviado! Estamos verificando tu colegiatura'); nav('/pro', { replace: true }) }, onError: (e) => toast.error(e.message) })

  return (
    <div className="mx-auto max-w-xl pb-10">
      <button type="button" aria-label="Volver" onClick={() => nav(-1)} className="mb-4 grid size-10 place-items-center rounded-full bg-surface-2 hover:bg-border"><ArrowLeft className="size-4" /></button>
      <h1 className="text-4xl font-bold leading-tight">Ofrece tus servicios en MediCall</h1>
      <p className="mb-6 mt-2 text-sm text-muted">Atiende pacientes por videollamada como profesional independiente: tú pones tu tarifa y tu horario. Verificamos tu colegiatura antes de publicar tu perfil.</p>
      {profile.data && <p className="mb-6 rounded-2xl bg-surface-2 p-3 text-sm">Tu perfil público usará tu nombre: <b>{profile.data.firstName} {profile.data.lastName}</b>.</p>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
        <section aria-labelledby="f1" className="space-y-4">
          <h2 id="f1" className="text-xl font-bold">1. Tu perfil profesional</h2>
          <div className="grid grid-cols-[6.5rem_1fr] gap-3">
            <SelectField label="Título" {...reg('title')}><option>Dr.</option><option>Dra.</option><option>Lic.</option></SelectField>
            <SelectField label="Especialidad" error={errors.specialty?.message} {...reg('specialty')}><option value="">Elige…</option>{SPECIALTIES.map((s) => <option key={s}>{s}</option>)}</SelectField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="N.º de colegiatura" inputMode="numeric" placeholder="78421" error={errors.cmp?.message} {...reg('cmp')} />
            <Field label="Años de experiencia" type="number" inputMode="numeric" min={0} error={errors.yearsExperience?.message} {...reg('yearsExperience', { valueAsNumber: true })} />
          </div>
          <TextareaField label="Sobre ti" hint="Qué atiendes y cómo trabajas. Los pacientes lo verán en tu perfil." error={errors.bio?.message} {...reg('bio')} />
          <TextareaField label="Formación (opcional)" hint="Una línea por título o estudio." placeholder={'Médico Cirujano · Universidad…'} {...reg('education')} />
          <Controller control={control} name="languages" render={({ field }) => (
            <fieldset><legend className="mb-2 text-sm font-medium">Idiomas de atención</legend>
              <div className="flex flex-wrap gap-2">{LANGUAGES.map((l) => { const on = field.value.includes(l); return <button key={l} type="button" aria-pressed={on} onClick={() => field.onChange(on ? field.value.filter((x) => x !== l) : [...field.value, l])} className={chip(on)}>{l}</button> })}</div>
              {errors.languages && <p role="alert" className="mt-1 text-sm text-danger-foreground dark:text-danger">{errors.languages.message}</p>}
            </fieldset>)} />
        </section>

        <section aria-labelledby="f2" className="space-y-4">
          <h2 id="f2" className="text-xl font-bold">2. Tarifa</h2>
          <Field label="Tarifa por teleconsulta de 30 min (S/)" type="number" inputMode="decimal" min={15} max={400} error={errors.price?.message} {...reg('price', { valueAsNumber: true })} />
          <p className="text-xs text-muted">Los seguimientos de 15 min se ofrecen automáticamente al 60 % de tu tarifa. Podrás editarla cuando quieras.</p>
        </section>

        <section aria-labelledby="f3" className="space-y-4">
          <h2 id="f3" className="text-xl font-bold">3. Horario de atención</h2>
          <Controller control={control} name="days" render={({ field }) => (
            <fieldset><legend className="mb-2 text-sm font-medium">Días</legend>
              <div className="flex flex-wrap gap-2">{WEEK.map(([l, d]) => { const on = field.value.includes(d); return <button key={d} type="button" aria-pressed={on} onClick={() => field.onChange(on ? field.value.filter((x) => x !== d) : [...field.value, d])} className={chip(on)}>{l}</button> })}</div>
              {errors.days && <p role="alert" className="mt-1 text-sm text-danger-foreground dark:text-danger">{errors.days.message}</p>}
            </fieldset>)} />
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Desde" {...reg('startHour', { valueAsNumber: true })}>{HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}</SelectField>
            <SelectField label="Hasta" error={errors.endHour?.message} {...reg('endHour', { valueAsNumber: true })}>{HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}</SelectField>
          </div>
        </section>

        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-0.5 size-5 accent-[var(--primary-strong)]" {...reg('consent')} />
          <span>Declaro que mis datos profesionales son verídicos y acepto los términos para profesionales de MediCall.</span>
        </label>
        {errors.consent && <p role="alert" className="text-sm text-danger-foreground dark:text-danger">{errors.consent.message}</p>}

        <div className="space-y-3">
          <Button type="submit" size="lg" className="w-full" loading={register.isPending}><ShieldCheck className="size-4" /> Enviar para verificación</Button>
          <Link to="/perfil" className="block text-center text-sm text-muted underline-offset-4 hover:underline">Ahora no</Link>
        </div>
      </form>
    </div>
  )
}
