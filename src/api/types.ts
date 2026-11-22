export type Urgency = 'low' | 'medium' | 'high' | 'emergency'

export interface Symptom {
  id: string
  label: string
  icon: string // nombre de icono lucide
  hint: string
}

export interface TriageQuestion {
  id: string
  text: string
  options: { id: string; label: string; weight: number; redFlag?: boolean }[]
}

export interface TriageResult {
  urgency: Urgency
  title: string
  advice: string
  recommendedPath: 'teleconsult' | 'clinic' | 'emergency'
}

export interface DoctorService {
  id: string
  name: string
  durationMin: number
  price: number
}

/** Horario semanal recurrente. days: 0 = domingo … 6 = sábado. */
export interface Availability {
  days: number[]
  startHour: number
  endHour: number
}

/** Profesional de la salud independiente que ofrece sus servicios en la plataforma. */
export interface Doctor {
  id: string
  name: string
  specialty: string
  cmp: string // Colegio Médico del Perú
  verified: boolean
  rating: number
  reviews: number
  price: number // tarifa base de teleconsulta
  etaMinutes: number
  online: boolean
  languages: string[]
  avatarHue: number
  bio: string
  yearsExperience: number
  education: string[]
  services: DoctorService[]
  availability: Availability
  joinedAt: string
  isFavorite?: boolean
}

export type DoctorSort = 'rating' | 'price' | 'online'

export interface DoctorFilters {
  query?: string
  specialty?: string
  onlineOnly?: boolean
  favoritesOnly?: boolean
  sort?: DoctorSort
}

/** 'fair' (por defecto): rotación pseudoaleatoria por sesión, sin ventaja para nadie. */
export type AvailabilitySort = 'fair' | 'soonest' | 'rating' | 'price'

/** Búsqueda de oferta para un día: qué profesionales tienen cupos y cuáles. */
export interface AvailabilityQuery {
  date: string // yyyy-mm-dd local
  query?: string
  specialty?: string
  sort?: AvailabilitySort
  /** Semilla de la rotación 'fair': misma semilla = mismo orden (paginación estable). */
  seed?: string
  /** Fuerza incluir a este profesional (p. ej. llegó desde su perfil) aunque no coincida con filtros. */
  pinId?: string
  offset?: number
  limit?: number
}

export interface DoctorAvailability {
  doctor: Doctor
  slots: string[]
}

export interface AvailabilityPage {
  items: DoctorAvailability[]
  total: number
}

export interface DoctorReview {
  id: string
  author: string
  rating: number
  comment: string
  date: string
}

export interface DoctorReviews {
  average: number
  total: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
  items: DoctorReview[]
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export interface ProProfile {
  doctor: Doctor
  verification: VerificationStatus
  submittedAt: string
  online: boolean
}

export interface ProRegisterInput {
  title: 'Dr.' | 'Dra.' | 'Lic.'
  specialty: string
  cmp: string
  yearsExperience: number
  bio: string
  price: number
  languages: string[]
  education: string[]
  availability: Availability
}

export type ConsultationStatus = 'searching' | 'matched' | 'in_progress' | 'completed' | 'cancelled'

export interface Prescription {
  medication: string
  dose: string
  duration: string
}

export interface Consultation {
  id: string
  symptomId: string
  symptomLabel: string
  status: ConsultationStatus
  doctor?: Doctor
  createdAt: string
  price: number
  discount: number
  total: number
  couponCode?: string
  notes?: string
  prescriptions?: Prescription[]
  referral?: { reason: string; clinicId?: string }
  rating?: number
  xpEarned?: number
}

export interface Appointment {
  id: string
  doctor: Doctor
  startsAt: string // ISO
  durationMin: number
  reason: string
  status: 'scheduled' | 'cancelled' | 'completed'
  price: number
  consultationId?: string
}

export interface BookAppointmentInput {
  doctorId: string
  startsAt: string
  reason: string
}

export interface Clinic {
  id: string
  name: string
  district: string
  distanceKm: number
  specialties: string[]
  openNow: boolean
  rating: number
  nextSlot: string
  partnerDiscount: number // 0..1
}

export interface Coupon {
  id: string
  code: string
  title: string
  description: string
  percent: number
  unlockLevel: number
  expiresAt: string
  state: 'locked' | 'available' | 'used'
}

export interface PaymentMethod {
  id: string
  kind: 'card' | 'yape' | 'plin'
  label: string
  last4?: string
  isDefault: boolean
}

export interface Transaction {
  id: string
  title: string
  amount: number
  createdAt: string
}

export interface Wallet {
  balance: number
  methods: PaymentMethod[]
  transactions: Transaction[]
}

export interface Mission {
  id: string
  title: string
  description: string
  icon: string
  xp: number
  progress: number
  target: number
  claimed: boolean
}

export interface Badge {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
}

export interface Wellness {
  xp: number
  level: number
  levelName: string
  xpIntoLevel: number
  xpForNextLevel: number
  streak: number
  checkedInToday: boolean
  weekCheckIns: boolean[] // lunes → domingo
  missions: Mission[]
  badges: Badge[]
}

export interface Profile {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  birthDate: string
  allergies: string[]
  conditions: string[]
  dependents: { id: string; name: string; relation: string }[]
  onboarded: boolean
}

export interface Promo {
  id: string
  title: string
  subtitle: string
  cta: string
  tone: 'mint' | 'lavender' | 'peach'
}

export interface RequestConsultationInput {
  symptomId: string
  urgency: Urgency
  couponCode?: string
  doctorId?: string
}

/** Contrato del backend. La implementación real (HTTP) deberá cumplir esta interfaz. */
export interface MediCallApi {
  profile: {
    get(): Promise<Profile>
    update(patch: Partial<Profile>): Promise<Profile>
    completeOnboarding(patch: Partial<Profile>): Promise<Profile>
  }
  catalog: {
    symptoms(): Promise<Symptom[]>
    promos(): Promise<Promo[]>
  }
  triage: {
    questions(symptomId: string): Promise<TriageQuestion[]>
    evaluate(symptomId: string, answers: Record<string, string>): Promise<TriageResult>
  }
  doctors: {
    list(filters?: DoctorFilters): Promise<Doctor[]>
    get(id: string): Promise<Doctor>
    reviews(id: string): Promise<DoctorReviews>
    specialties(): Promise<string[]>
    toggleFavorite(id: string): Promise<Doctor>
  }
  /** Lado del profesional independiente: alta, verificación y disponibilidad. */
  pro: {
    get(): Promise<ProProfile | null>
    register(input: ProRegisterInput): Promise<ProProfile>
    setOnline(online: boolean): Promise<ProProfile>
  }
  appointments: {
    /** Horarios libres (ISO) de un médico en una fecha local yyyy-mm-dd. */
    slots(doctorId: string, date: string): Promise<string[]>
    /** Marketplace: profesionales con cupos libres ese día, filtrables y paginados. */
    search(q: AvailabilityQuery): Promise<AvailabilityPage>
    list(): Promise<Appointment[]>
    book(input: BookAppointmentInput): Promise<Appointment>
    cancel(id: string): Promise<Appointment>
    /** Convierte la cita en una consulta en curso (ventana: 10 min antes → 60 min después). */
    join(id: string): Promise<Consultation>
  }
  consultations: {
    list(): Promise<Consultation[]>
    get(id: string): Promise<Consultation>
    request(input: RequestConsultationInput): Promise<Consultation>
    cancel(id: string): Promise<Consultation>
    start(id: string): Promise<Consultation>
    finish(id: string): Promise<Consultation>
    rate(id: string, rating: number): Promise<Consultation>
  }
  clinics: {
    nearby(): Promise<Clinic[]>
    book(clinicId: string, consultationId?: string): Promise<{ confirmationCode: string }>
  }
  wallet: {
    get(): Promise<Wallet>
    coupons(): Promise<Coupon[]>
    validateCoupon(code: string): Promise<Coupon>
  }
  wellness: {
    get(): Promise<Wellness>
    checkIn(): Promise<Wellness>
    claimMission(id: string): Promise<Wellness>
  }
}
