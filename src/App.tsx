import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AppRouter } from './app-router'
import { useTheme } from './stores/theme'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
})

export default function App() {
  const theme = useTheme((s) => s.theme)
  return (
    <QueryClientProvider client={queryClient}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2">Saltar al contenido</a>
      <AppRouter />
      <Toaster position="top-center" theme={theme === 'dark' ? 'dark' : 'light'} />
    </QueryClientProvider>
  )
}
