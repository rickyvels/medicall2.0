import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import { useProfile } from '@/api/hooks'
import { AppShell } from '@/components/layout/AppShell'
import { FocusLayout } from '@/components/layout/FocusLayout'
import { Skeleton } from '@/components/ui/skeleton'

const Home = lazy(() => import('@/features/home/HomePage'))
const Triage = lazy(() => import('@/features/triage/TriagePage'))
const Result = lazy(() => import('@/features/triage/ResultPage'))
const Matching = lazy(() => import('@/features/matching/MatchingPage'))
const Room = lazy(() => import('@/features/consult/ConsultRoomPage'))
const Summary = lazy(() => import('@/features/consult/SummaryPage'))
const History = lazy(() => import('@/features/consult/HistoryPage'))
const Schedule = lazy(() => import('@/features/schedule/SchedulePage'))
const Doctors = lazy(() => import('@/features/doctors/DoctorsPage'))
const DoctorProfile = lazy(() => import('@/features/doctors/DoctorProfilePage'))
const ProRegister = lazy(() => import('@/features/pro/ProRegisterPage'))
const ProStatus = lazy(() => import('@/features/pro/ProStatusPage'))
const Clinics = lazy(() => import('@/features/clinics/ClinicsPage'))
const Wellness = lazy(() => import('@/features/wellness/WellnessPage'))
const Wallet = lazy(() => import('@/features/wallet/WalletPage'))
const Profile = lazy(() => import('@/features/profile/ProfilePage'))
const Animations = lazy(() => import('@/features/dev/AnimationsPage'))
const Onboarding = lazy(() => import('@/features/onboarding/OnboardingPage'))

const Fallback = () => <div className="space-y-4 p-4" role="status" aria-label="Cargando"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-48" /></div>

/** Redirige a onboarding hasta que el perfil esté completo. */
function Guard() {
  const { data, isPending } = useProfile()
  if (isPending) return <Fallback />
  if (data && !data.onboarded) return <Navigate to="/bienvenida" replace />
  return <Outlet />
}

const router = createBrowserRouter([
  ...(import.meta.env.DEV ? [{ path: '/dev/animaciones', element: <Suspense fallback={null}><Animations /></Suspense> }] : []),
  { path: '/bienvenida', element: <Suspense fallback={<Fallback />}><Onboarding /></Suspense> },
  {
    element: <Guard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Suspense fallback={<Fallback />}><Home /></Suspense> },
          { path: 'consulta/:id/resumen', element: <Suspense fallback={<Fallback />}><Summary /></Suspense> },
          { path: 'consultas', element: <Suspense fallback={<Fallback />}><History /></Suspense> },
          { path: 'medicos', element: <Suspense fallback={<Fallback />}><Doctors /></Suspense> },
          { path: 'pro', element: <Suspense fallback={<Fallback />}><ProStatus /></Suspense> },
          { path: 'clinicas', element: <Suspense fallback={<Fallback />}><Clinics /></Suspense> },
          { path: 'bienestar', element: <Suspense fallback={<Fallback />}><Wellness /></Suspense> },
          { path: 'wallet', element: <Suspense fallback={<Fallback />}><Wallet /></Suspense> },
          { path: 'perfil', element: <Suspense fallback={<Fallback />}><Profile /></Suspense> },
        ],
      },
      {
        element: <FocusLayout />,
        children: [
          { path: 'triaje/resultado', element: <Suspense fallback={<Fallback />}><Result /></Suspense> },
          { path: 'triaje/:symptomId', element: <Suspense fallback={<Fallback />}><Triage /></Suspense> },
          { path: 'agendar', element: <Suspense fallback={<Fallback />}><Schedule /></Suspense> },
          { path: 'medicos/:id', element: <Suspense fallback={<Fallback />}><DoctorProfile /></Suspense> },
          { path: 'ofrece-tus-servicios', element: <Suspense fallback={<Fallback />}><ProRegister /></Suspense> },
          { path: 'buscando/:id', element: <Suspense fallback={<Fallback />}><Matching /></Suspense> },
        ],
      },
      // Sala de consulta a pantalla completa (sin shell)
      { path: 'consulta/:id', element: <Suspense fallback={<Fallback />}><Room /></Suspense> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
], { basename: '/app' }) // todas las rutas de la app cuelgan de /app; la landing ocupa "/"

export const AppRouter = () => <RouterProvider router={router} />
