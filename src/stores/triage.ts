import { create } from 'zustand'
import type { TriageResult, Urgency } from '@/api/types'

/** Estado efímero del flujo triaje → matching. */
interface FlowState {
  symptomId: string | null
  urgency: Urgency | null
  result: TriageResult | null
  couponCode: string | null
  doctorId: string | null // médico elegido desde su perfil (consulta inmediata)
  setResult: (symptomId: string, result: TriageResult, doctorId?: string | null) => void
  setCoupon: (code: string | null) => void
  reset: () => void
}

export const useFlow = create<FlowState>((set) => ({
  symptomId: null,
  urgency: null,
  result: null,
  couponCode: null,
  doctorId: null,
  setResult: (symptomId, result, doctorId = null) => set({ symptomId, result, urgency: result.urgency, doctorId }),
  setCoupon: (couponCode) => set({ couponCode }),
  reset: () => set({ symptomId: null, urgency: null, result: null, couponCode: null, doctorId: null }),
}))
