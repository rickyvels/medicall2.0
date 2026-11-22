import React, { useState } from 'react'
import {
  ArrowRight,
  WifiSlash,
  QrCode,
  MapPin,
  ShieldCheck,
  CheckCircle,
  List,
  X,
  Sparkle,
  Quotes,
  CaretRight,
  ChatCircleDots,
  Pill,
} from '@phosphor-icons/react'
import { Button } from './ui/button'

export const LandingView: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleStart = () => {
    window.location.assign('/app') // la app vive bajo /app (otro router, carga propia)
  }

  return (
    <div className="landing-theme flex min-h-screen flex-col bg-background text-foreground font-sans">
      {/* Top Announcement Banner */}
      <div className="border-b border-border bg-muted/60 transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-6 py-2.5 text-center text-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2.5 py-0.5 font-sans text-sm font-semibold text-background">
            <Sparkle size={14} weight="fill" /> En Vivo
          </span>
          <span className="font-medium text-foreground">
            Doctores en línea listos para responder tus síntomas y emitir tu receta al instante.
          </span>
          <button
            onClick={handleStart}
            className="cursor-pointer font-semibold underline underline-offset-4 hover:opacity-80 inline-flex items-center gap-1 text-foreground"
          >
            Consultar ahora <CaretRight size={14} />
          </button>
        </div>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex cursor-pointer items-center gap-2"
            >
              <img
                src="https://res.cloudinary.com/de1xmnmeq/image/upload/v1789539783/Group_1_1_ultzye.svg"
                alt="Medicall Logo"
                className="h-8 w-auto logo-themed"
              />
            </div>
            <nav className="hidden items-center gap-6 md:flex">
              <a
                href="#como-funciona"
                className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Cómo Funciona
              </a>
              <a
                href="#sintomas"
                className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Síntomas y Especialidades
              </a>
              <a
                href="#beneficios"
                className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Beneficios
              </a>
              <a
                href="#tarifas"
                className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Tarifas
              </a>
              <a
                href="#faq"
                className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Preguntas
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              rounded="full"
              onClick={handleStart}
              className="hidden sm:inline-flex"
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="default"
              size="sm"
              rounded="full"
              onClick={handleStart}
            >
              Consultar con un Doctor
            </Button>
            <button
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav className="space-y-1 border-t border-border bg-card px-6 py-4 md:hidden">
            <a
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Cómo Funciona
            </a>
            <a
              href="#sintomas"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Síntomas y Especialidades
            </a>
            <a
              href="#beneficios"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Beneficios
            </a>
            <a
              href="#tarifas"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Tarifas
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Preguntas
            </a>
          </nav>
        )}
      </header>

      {/* Main Content Container */}
      <main className="mx-auto w-full max-w-6xl border-x border-border">
        {/* HERO SECTION */}
        <section className="border-b border-border px-6 pb-16 pt-16 text-center sm:px-12 sm:pt-24 lg:px-16">
          <h1 className="mx-auto mt-6 max-w-4xl text-xl font-normal text-foreground sm:text-5xl font-heading">
            ¿Te sientes mal? Consulta a un médico al instante y obtén tu receta
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Haz micro-consultas médicas accesibles: cuéntale a un doctor qué te duele,
            recibe orientación profesional en minutos, tu receta electrónica y pide tus
            medicamentos sin salir de casa.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              data-testid="start-button"
              size="lg"
              rounded="full"
              onClick={handleStart}
              className="px-8 shadow-md"
            >
              Hacer una consulta breve <ArrowRight size={18} className="ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              rounded="full"
              onClick={() => {
                const el = document.getElementById('como-funciona')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-6"
            >
              Ver cómo funciona
            </Button>
          </div>

          {/* Preview Image of Consultation (Ultra Large Full Showcase) */}
          <div className="mx-auto mt-14 w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl transition-all hover:scale-[1.01]">
            <img
              src="https://res.cloudinary.com/de1xmnmeq/image/upload/v1789548277/Frame_42_v60w0z.png"
              alt="Consulta Médica y Receta Digital Medicall"
              className="w-full h-auto object-cover rounded-3xl"
            />
          </div>
        </section>

        {/* TRUSTED MEDICAL NETWORKS */}
        <section className="border-b border-border px-6 py-10">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Red de médicos certificados y farmacias aliadas en todo el país
          </p>
          <div className="relative mt-6 overflow-hidden">
            <div className="animate-marquee-scroll flex items-center gap-12 opacity-70">
              <span className="shrink-0 text-base font-bold text-foreground">Colegio Médico Verificado</span>
              <span className="shrink-0 text-base font-bold text-foreground">FarmaExpress Digital</span>
              <span className="shrink-0 text-base font-bold text-foreground">Boticas Salud Total</span>
              <span className="shrink-0 text-base font-bold text-foreground">Red Clínica San Borja</span>
              <span className="shrink-0 text-base font-bold text-foreground">MedIntegra 24 Horas</span>
              <span className="shrink-0 text-base font-bold text-foreground">Centro Pediátrico Especializado</span>
              {/* Repetition */}
              <span className="shrink-0 text-base font-bold text-foreground">Colegio Médico Verificado</span>
              <span className="shrink-0 text-base font-bold text-foreground">FarmaExpress Digital</span>
              <span className="shrink-0 text-base font-bold text-foreground">Boticas Salud Total</span>
              <span className="shrink-0 text-base font-bold text-foreground">Red Clínica San Borja</span>
              <span className="shrink-0 text-base font-bold text-foreground">MedIntegra 24 Horas</span>
              <span className="shrink-0 text-base font-bold text-foreground">Centro Pediátrico Especializado</span>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="como-funciona" className="border-b border-border px-6 py-16 sm:px-16 lg:px-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-muted-foreground">
              Proceso Simple y Rápido
            </span>
            <h2 className="mt-3 text-3xl font-normal text-foreground sm:text-4xl font-heading">
              ¿Cómo funciona una consulta en Medicall?
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Sin citas con días de anticipación ni salas de espera. Atención médica profesional en 3 pasos.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-6 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pastel-amber text-pastel-amber-foreground font-bold text-base">
                1
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground font-heading">
                Cuéntanos tu síntoma
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Describe lo que sientes: dolor de cabeza, malestar estomacal, fiebre o sarpullido en un breve formulario o chat.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pastel-blue text-pastel-blue-foreground font-bold text-base">
                2
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground font-heading">
                Respuesta del médico
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Un doctor colegiado evalúa tus síntomas, te orienta sobre qué puede ser y te da indicaciones de tratamiento.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pastel-sage text-pastel-sage-foreground font-bold text-base">
                3
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground font-heading">
                Receta y medicamentos
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Recibe tu receta digital firmada y pide tus medicamentos directamente desde la farmacia integrada de Medicall.
              </p>
            </div>
          </div>
        </section>

        {/* COMMON SYMPTOMS & SPECIALTIES */}
        <section id="sintomas" className="border-b border-border px-6 py-12 sm:px-16 lg:px-28">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="text-sm font-semibold text-muted-foreground">
                Consultas Rápidas Más Frecuentes
              </span>
              <h2 className="mt-2 text-2xl font-normal text-foreground font-heading">
                ¿Qué malestar deseas consultar hoy?
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground">
                Dolor de Cabeza & Migraña
              </span>
              <span className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground">
                Fiebre & Gripe
              </span>
              <span className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground">
                Molestias Digestivas
              </span>
              <span className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground">
                Alergias & Piel
              </span>
              <span className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground">
                Salud Pediátrica
              </span>
              <span className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground">
                Dolores Musculares
              </span>
            </div>
          </div>
        </section>

        {/* PLATFORM BENEFITS & INTEGRATIONS (BENTO) */}
        <section id="beneficios" className="border-b border-border px-6 py-16 sm:px-16 lg:px-28">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold text-muted-foreground">
              Todo Integrado en la Misma App
            </span>
            <h2 className="mt-3 text-3xl font-normal text-foreground sm:text-4xl font-heading">
              La solución completa: del síntoma a tu medicamento en mano.
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Diseñado para resolver tus dudas de salud en minutos sin complicaciones innecesarias.
            </p>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-pastel-blue text-pastel-blue-foreground">
                <ChatCircleDots size={20} weight="duotone" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground font-heading">
                Consultas Breves y Accesibles
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Paga un precio mínimo solo por la consulta que necesitas, sin planes forzosos ni esperas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-pastel-sage text-pastel-sage-foreground">
                <QrCode size={20} weight="duotone" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground font-heading">
                Recetas Digitales Validadas
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Prescripciones electrónicas firmadas digitalmente con código QR listas para farmacia.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-pastel-amber text-pastel-amber-foreground">
                <Pill size={20} weight="duotone" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground font-heading">
                Farmacia y Entrega Integrada
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Canjea tu receta y pide tus medicamentos directamente desde el módulo de compras de Medicall.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-pastel-rose text-pastel-rose-foreground">
                <MapPin size={20} weight="duotone" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground font-heading">
                Mapa de Farmacias Cercanas
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Si prefieres recoger tus pastillas, localiza en el mapa interactivo las boticas con stock disponible.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="flex flex-col bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-pastel-blue text-pastel-blue-foreground">
                <WifiSlash size={20} weight="duotone" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground font-heading">
                Disponibilidad Offline
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Accede a tus recetas previas, historial de dosis y recordatorios incluso si te quedas sin conexión.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="flex flex-col bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-pastel-amber text-pastel-amber-foreground">
                <ShieldCheck size={20} weight="duotone" />
              </span>
              <h3 className="mt-4 text-lg font-medium text-foreground font-heading">
                Doctores 100% Verificados
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Cada especialista cuenta con número de colegiatura médica validado y experiencia clínica comprobada.
              </p>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL QUOTE */}
        <section className="border-b border-border px-6 py-16 text-center sm:px-16 lg:px-28">
          <Quotes size={36} weight="duotone" className="mx-auto text-muted-foreground/60 mb-4" />
          <blockquote className="mx-auto max-w-3xl text-2xl font-medium text-foreground font-heading sm:text-3xl">
            &ldquo;Tenía un dolor de cabeza insoportable en la noche. En menos de 5 minutos un doctor me orientó por la app, me dijo exactamente qué tomar y pedí las pastillas al instante.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
              SV
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Sofía Valdivia</p>
              <p className="text-sm text-muted-foreground">Usuaria verificada · Lima</p>
            </div>
          </div>
        </section>

        {/* PRICING & CONSULTATION FEES */}
        <section id="tarifas" className="border-b border-border px-6 py-16 sm:px-16 lg:px-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-muted-foreground">Tarifas Transparentes</span>
            <h2 className="mt-3 text-3xl font-normal text-foreground sm:text-4xl font-heading">
              Paga por consulta o elige un pase de salud mensual.
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Sin letras pequeñas ni cobros ocultos. Atención médica de calidad a un costo accesible.
            </p>
          </div>

          <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
            {/* Consulta Puntual */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Consulta Puntual</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Para resolver una duda médica inmediata.</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">$4.99</span>
                <span className="text-sm text-muted-foreground">/ consulta</span>
              </div>
              <Button
                variant="outline"
                size="default"
                rounded="full"
                onClick={handleStart}
                className="mt-6 w-full"
              >
                Hacer consulta ahora
              </Button>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-pastel-sage-foreground shrink-0" />
                  Atención médica por chat en &lt; 5 min
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-pastel-sage-foreground shrink-0" />
                  Receta médica digital firmada
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-pastel-sage-foreground shrink-0" />
                  Compra directa en farmacia integrada
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-pastel-sage-foreground shrink-0" />
                  Historial guardado en tu cuenta
                </li>
              </ul>
            </div>

            {/* Plan Salud Mensual (Popular) */}
            <div className="rounded-2xl border-2 border-foreground bg-card p-6 shadow-md">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Plan Familiar</h3>
                <span className="rounded-full bg-foreground px-2.5 py-0.5 text-sm font-semibold text-background">
                  Más Popular
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Para ti y hasta 3 miembros de tu familia.</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">$12.99</span>
                <span className="text-sm text-muted-foreground">/ mes</span>
              </div>
              <Button
                variant="default"
                size="default"
                rounded="full"
                onClick={handleStart}
                className="mt-6 w-full shadow-md"
              >
                Suscribirme al plan
              </Button>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-pastel-sage-foreground shrink-0" />
                  4 consultas médicas incluidas por mes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-pastel-sage-foreground shrink-0" />
                  Descuento exclusivo en medicamentos
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-pastel-sage-foreground shrink-0" />
                  Historial médico de toda la familia
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-pastel-sage-foreground shrink-0" />
                  Atención prioritaria en cola
                </li>
              </ul>
            </div>

            {/* Plan Ilimitado */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Plan Ilimitado</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Para tranquilidad médica total 24/7.</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">$24.99</span>
                <span className="text-sm text-muted-foreground">/ mes</span>
              </div>
              <Button
                variant="outline"
                size="default"
                rounded="full"
                onClick={handleStart}
                className="mt-6 w-full"
              >
                Obtener Plan Ilimitado
              </Button>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-pastel-sage-foreground shrink-0" />
                  Consultas breves ilimitadas 24/7
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-pastel-sage-foreground shrink-0" />
                  Envío gratis en farmacia en pedidos seleccionados
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-pastel-sage-foreground shrink-0" />
                  Acceso a especialistas (pediatría, nutrición)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} weight="fill" className="text-pastel-sage-foreground shrink-0" />
                  Soporte premium personalizado
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="border-b border-border px-6 py-16 sm:px-16 lg:px-28">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-2xl font-normal text-foreground font-heading">
              Preguntas Frecuentes
            </h2>
            <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              <div className="p-5">
                <p className="text-base font-semibold text-foreground">
                  ¿Cuánto tiempo demora un doctor en responder mi consulta?
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  El tiempo promedio de respuesta es menor a 5 minutos. Contamos con médicos de guardia conectados las 24 horas del día.
                </p>
              </div>
              <div className="p-5">
                <p className="text-base font-semibold text-foreground">
                  ¿Cómo funciona la receta y la compra de medicamentos?
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Al finalizar la consulta, el médico emite una receta digital firmada. Puedes pulsar el botón de compra para ordenar los medicamentos directamente desde la app o mostrar el código QR en una botica afiliada.
                </p>
              </div>
              <div className="p-5">
                <p className="text-base font-semibold text-foreground">
                  ¿Qué tipo de problemas de salud puedo consultar?
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Puedes consultar cualquier malestar no urgente: dolor de cabeza, migraña, resfríos, problemas estomacales, dudas sobre dosificación, alergias leves, sarpullidos y consejos de salud general.
                </p>
              </div>
              <div className="p-5">
                <p className="text-base font-semibold text-foreground">
                  ¿Los médicos están colegiados y certificados?
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sí. El 100% de los doctores en Medicall pasan por un estricto proceso de validación de colegiatura médica y antecedentes profesionales antes de poder atender consultas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CONVERSION CTA */}
        <section className="px-6 py-20 text-center sm:px-16 lg:px-28">
          <h2 className="mx-auto max-w-2xl text-4xl font-normal text-foreground font-heading sm:text-5xl">
            ¿Tienes un malestar? Resuelve tus dudas médicas ahora.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Conecta con un doctor en minutos y recibe orientación médica clara y segura.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              rounded="full"
              onClick={handleStart}
              className="px-8 shadow-md"
            >
              Consultar con un Doctor <ArrowRight size={18} className="ml-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              rounded="full"
              onClick={handleStart}
              className="px-6"
            >
              Ver Farmacia y Medicamentos
            </Button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <img
                  src="https://res.cloudinary.com/de1xmnmeq/image/upload/v1789539783/Group_1_1_ultzye.svg"
                  alt="Medicall Logo"
                  className="h-7 w-auto logo-themed"
                />
              </div>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                Consultas médicas rápidas, recetas digitales y entrega de medicamentos al instante con doctores certificados.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-pastel-sage-foreground"></span>
                <span>Doctores disponibles en línea 24/7</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">Consultas</p>
              <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#como-funciona" className="hover:text-foreground">Cómo Funciona</a></li>
                <li><a href="#sintomas" className="hover:text-foreground">Dolor de Cabeza & Gripe</a></li>
                <li><a href="#sintomas" className="hover:text-foreground">Molestias Estomacales</a></li>
                <li><a href="#sintomas" className="hover:text-foreground">Pediatría & Alergias</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">Integraciones</p>
              <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#beneficios" className="hover:text-foreground">Receta Electrónica</a></li>
                <li><a href="#beneficios" className="hover:text-foreground">Farmacia & Boticas</a></li>
                <li><a href="#beneficios" className="hover:text-foreground">Mapa de Boticas</a></li>
                <li><a href="#beneficios" className="hover:text-foreground">Modo Sin Conexión</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">Legal & Seguridad</p>
              <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleStart(); }} className="hover:text-foreground">Privacidad Médica</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleStart(); }} className="hover:text-foreground">Términos del Servicio</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleStart(); }} className="hover:text-foreground">Registro de Colegiatura</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
            Copyright 2026 Medicall Technologies. Consultas Médicas y Farmacia Digital.
          </div>
        </div>
      </footer>
    </div>
  )
}
