import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '.'
import type { AvailabilityQuery, BookAppointmentInput, DoctorFilters, ProRegisterInput, RequestConsultationInput } from './types'

export const qk = {
  profile: ['profile'] as const,
  symptoms: ['symptoms'] as const,
  promos: ['promos'] as const,
  questions: (id: string) => ['triage', 'questions', id] as const,
  doctors: (f: DoctorFilters = {}) => ['doctors', f] as const,
  doctor: (id: string) => ['doctor', id] as const,
  reviews: (id: string) => ['doctor', id, 'reviews'] as const,
  specialties: ['specialties'] as const,
  pro: ['pro'] as const,
  appointments: ['appointments'] as const,
  slots: (doctorId: string, date: string) => ['slots', doctorId, date] as const,
  consultations: ['consultations'] as const,
  consultation: (id: string) => ['consultation', id] as const,
  clinics: ['clinics'] as const,
  wallet: ['wallet'] as const,
  coupons: ['coupons'] as const,
  wellness: ['wellness'] as const,
}

export const useProfile = () => useQuery({ queryKey: qk.profile, queryFn: api.profile.get })
export const useSymptoms = () => useQuery({ queryKey: qk.symptoms, queryFn: api.catalog.symptoms, staleTime: Infinity })
export const usePromos = () => useQuery({ queryKey: qk.promos, queryFn: api.catalog.promos })
export const useTriageQuestions = (symptomId: string) =>
  useQuery({ queryKey: qk.questions(symptomId), queryFn: () => api.triage.questions(symptomId) })
export const useDoctors = (filters: DoctorFilters = {}) =>
  useQuery({ queryKey: qk.doctors(filters), queryFn: () => api.doctors.list(filters), placeholderData: keepPreviousData })
export const useConsultations = () => useQuery({ queryKey: qk.consultations, queryFn: api.consultations.list })
export const useClinics = () => useQuery({ queryKey: qk.clinics, queryFn: api.clinics.nearby })
export const useWallet = () => useQuery({ queryKey: qk.wallet, queryFn: api.wallet.get })
export const useCoupons = () => useQuery({ queryKey: qk.coupons, queryFn: api.wallet.coupons })
export const useWellness = () => useQuery({ queryKey: qk.wellness, queryFn: api.wellness.get })

/** Hace polling mientras la consulta se está emparejando. */
export const useConsultation = (id: string) =>
  useQuery({
    queryKey: qk.consultation(id),
    queryFn: () => api.consultations.get(id),
    placeholderData: keepPreviousData,
    refetchInterval: (q) => (q.state.data?.status === 'searching' ? 1000 : false),
  })

export const useCompleteOnboarding = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.profile.completeOnboarding,
    onSuccess: (p) => {
      qc.setQueryData(qk.profile, p)
      qc.invalidateQueries({ queryKey: qk.wellness })
    },
  })
}

export const useEvaluateTriage = () =>
  useMutation({ mutationFn: (v: { symptomId: string; answers: Record<string, string> }) => api.triage.evaluate(v.symptomId, v.answers) })

export const useValidateCoupon = () => useMutation({ mutationFn: api.wallet.validateCoupon })

export const useRequestConsultation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: RequestConsultationInput) => api.consultations.request(v),
    onSuccess: (c) => {
      qc.setQueryData(qk.consultation(c.id), c)
      qc.invalidateQueries({ queryKey: qk.consultations })
      qc.invalidateQueries({ queryKey: qk.coupons })
    },
  })
}

const useConsultationAction = (fn: (id: string) => Promise<unknown>) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: qk.consultation(id) })
      qc.invalidateQueries({ queryKey: qk.consultations })
      qc.invalidateQueries({ queryKey: qk.wellness })
      qc.invalidateQueries({ queryKey: qk.wallet })
    },
  })
}
export const useCancelConsultation = () => useConsultationAction(api.consultations.cancel)
export const useStartConsultation = () => useConsultationAction(api.consultations.start)
export const useFinishConsultation = () => useConsultationAction(api.consultations.finish)

export const useRateConsultation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { id: string; rating: number }) => api.consultations.rate(v.id, v.rating),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: qk.consultation(v.id) }),
  })
}

export const useBookClinic = () => useMutation({ mutationFn: (v: { clinicId: string; consultationId?: string }) => api.clinics.book(v.clinicId, v.consultationId) })

export const useCheckIn = () => {
  const qc = useQueryClient()
  return useMutation({ mutationFn: api.wellness.checkIn, onSuccess: (w) => { qc.setQueryData(qk.wellness, w); qc.invalidateQueries({ queryKey: qk.coupons }) } })
}
export const useClaimMission = () => {
  const qc = useQueryClient()
  return useMutation({ mutationFn: api.wellness.claimMission, onSuccess: (w) => { qc.setQueryData(qk.wellness, w); qc.invalidateQueries({ queryKey: qk.coupons }) } })
}

export const useDoctor = (id: string) => useQuery({ queryKey: qk.doctor(id), queryFn: () => api.doctors.get(id) })
export const useDoctorReviews = (id: string) => useQuery({ queryKey: qk.reviews(id), queryFn: () => api.doctors.reviews(id) })
export const useSpecialties = () => useQuery({ queryKey: qk.specialties, queryFn: api.doctors.specialties })

export const useToggleFavorite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.doctors.toggleFavorite,
    onSuccess: (d) => {
      qc.setQueryData(qk.doctor(d.id), d)
      qc.invalidateQueries({ queryKey: ['doctors'] })
    },
  })
}

/** Perfil profesional propio. Mientras está en revisión se consulta cada 2 s. */
export const usePro = () => {
  const qc = useQueryClient()
  return useQuery({
    queryKey: qk.pro,
    queryFn: async () => {
      const pro = await api.pro.get()
      if (pro?.verification === 'verified') qc.invalidateQueries({ queryKey: ['doctors'] }) // ya aparece en el directorio
      return pro
    },
    refetchInterval: (q) => (q.state.data?.verification === 'pending' ? 2000 : false),
  })
}

export const useRegisterPro = () => {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (v: ProRegisterInput) => api.pro.register(v), onSuccess: (p) => qc.setQueryData(qk.pro, p) })
}
export const useSetOnline = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.pro.setOnline,
    onSuccess: (p) => { qc.setQueryData(qk.pro, p); qc.invalidateQueries({ queryKey: ['doctors'] }); qc.invalidateQueries({ queryKey: ['doctor'] }) },
  })
}
export const useAppointments = () => useQuery({ queryKey: qk.appointments, queryFn: api.appointments.list })
export const useSlots = (doctorId: string | null, date: string) =>
  useQuery({ queryKey: qk.slots(doctorId ?? '', date), queryFn: () => api.appointments.slots(doctorId!, date), enabled: !!doctorId, staleTime: 0 })

export const useAvailability = (q: Omit<AvailabilityQuery, 'offset'>) =>
  useInfiniteQuery({
    queryKey: ['availability', q] as const,
    queryFn: ({ pageParam }) => api.appointments.search({ ...q, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => { const n = pages.reduce((a, p) => a + p.items.length, 0); return n < last.total ? n : undefined },
    staleTime: 0,
  })

export const useBookAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: BookAppointmentInput) => api.appointments.book(v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.appointments })
      qc.invalidateQueries({ queryKey: ['slots'] }); qc.invalidateQueries({ queryKey: ['availability'] })
      qc.invalidateQueries({ queryKey: qk.wellness })
    },
  })
}
export const useCancelAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.appointments.cancel,
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk.appointments }); qc.invalidateQueries({ queryKey: ['slots'] }); qc.invalidateQueries({ queryKey: ['availability'] }) },
  })
}
export const useJoinAppointment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.appointments.join,
    onSuccess: (c) => {
      qc.setQueryData(qk.consultation(c.id), c)
      qc.invalidateQueries({ queryKey: qk.appointments })
      qc.invalidateQueries({ queryKey: qk.consultations })
    },
  })
}
