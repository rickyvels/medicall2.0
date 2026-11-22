import { useEffect, useState } from 'react'

/** Reloj reactivo: re-renderiza cada `everyMs` para habilitar acciones por horario. */
export function useNow(everyMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), everyMs)
    return () => clearInterval(t)
  }, [everyMs])
  return now
}
