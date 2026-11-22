import { Outlet } from 'react-router-dom'

/** Layout para flujos enfocados (triaje, búsqueda): sin navegación, un solo objetivo. */
export function FocusLayout() {
  return (
    <main id="main" className="pt-safe mx-auto min-h-dvh w-full max-w-3xl px-4 pb-28 sm:px-6">
      <Outlet />
    </main>
  )
}
