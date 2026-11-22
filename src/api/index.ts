import type { MediCallApi } from './types'
import { mockApi } from './mock/client'

/**
 * Punto único de acceso al backend. Cuando exista la API real, se reemplaza
 * `mockApi` por un cliente HTTP que implemente `MediCallApi` (ver VITE_API_MODE).
 */
export const api: MediCallApi = mockApi
export * from './types'
