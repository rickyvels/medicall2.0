import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { applyTheme, useTheme } from './stores/theme'

applyTheme(useTheme.getState().theme)

/** La landing vive en "/" y la app (PWA) bajo "/app". Cada una se carga solo cuando hace falta. */
const inApp = /^\/app(\/|$)/.test(window.location.pathname)
const entry = inApp ? import('./App.tsx') : import('./features/landing/LandingView.tsx').then((m) => ({ default: m.LandingView }))

entry.then(({ default: Root }) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  )
})
