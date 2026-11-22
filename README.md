# MediCall (frontend PWA)

Marketplace de teleconsultas: **profesionales de la salud independientes** ofrecen sus servicios y los pacientes
los encuentran, ven su perfil público y consultan al instante o agendan. Si hace falta, se deriva a una clínica aliada.

## Stack
React 19 · TypeScript · Vite · Tailwind v4 · Radix · TanStack Query · Zustand · Framer Motion · lottie-web · vite-plugin-pwa · Vitest · Playwright.

## Scripts
- `npm run dev` — desarrollo (galería de animaciones en `/dev/animaciones`)
- `npm run check` — tipos + lint + tests unitarios
- `npm run test:e2e` — E2E móvil y escritorio (`SHOTS_DIR=ruta` guarda capturas para revisión visual)
- `node scripts/gen-lottie.mjs` — regenera las animaciones Lottie propias (`src/assets/lottie`)

## Funcionalidades
- **Paciente:** onboarding, triaje guiado (con derivación a emergencias), consulta inmediata o **agendada**
  (con exportación `.ics`), sala de videollamada, receta y resumen, clínicas aliadas, wallet y cupones, gamificación.
- **Directorio de médicos** (`/medicos`): búsqueda (sin tildes), filtros por especialidad/estado, orden, favoritos.
- **Perfil público** (`/medicos/:id`): credenciales, servicios y tarifas, formación, horario, reseñas.
- **Profesional independiente** (`/ofrece-tus-servicios`, `/pro`): alta con validación, verificación de colegiatura
  (simulada), disponibilidad semanal propia y estado "Disponible ahora". Al verificarse aparece en el directorio.

## Datos mockeados
No hay médicos ni datos escritos en la UI. Todo pasa por `src/api` (contrato `MediCallApi` en `types.ts`).
`src/api/mock` implementa ese contrato con latencia simulada y persistencia en `localStorage`
(Perfil → "Reiniciar datos de demo"). Para conectar el backend real, implementar `MediCallApi` con HTTP y exportarlo en `src/api/index.ts`.

## Diseño
Tokens semánticos en `src/index.css` (claro por defecto + oscuro). Quattrocento para títulos, Inter para UI.
Sidebar + ⌘K en escritorio, tab bar en móvil; flujos enfocados (triaje, búsqueda, agenda, perfil) sin navegación.
La imagen del hero (`public/images/hero-doctors.jpg`) es de baja resolución (678 px): conviene reemplazarla por una
versión grande y con licencia clara antes de producción.

## Pendiente
Video real (LiveKit/Daily), pagos, push notifications, panel completo del médico (cola, ganancias), mapa de clínicas,
reseñas reales tras cada consulta, backend de verificación de colegiatura.
