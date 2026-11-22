import type { Availability, Badge, Clinic, Coupon, Doctor, Mission, Profile, Promo, Symptom, TriageQuestion } from '../types'

export const symptoms: Symptom[] = [
  { id: 'headache', label: 'Dolor de cabeza', icon: 'Brain', hint: 'Migraña, tensión, presión' },
  { id: 'fever', label: 'Fiebre', icon: 'Thermometer', hint: 'Temperatura alta, escalofríos' },
  { id: 'cold', label: 'Resfrío o gripe', icon: 'Wind', hint: 'Tos, congestión, dolor de garganta' },
  { id: 'stomach', label: 'Malestar estomacal', icon: 'Pill', hint: 'Náuseas, diarrea, gastritis' },
  { id: 'skin', label: 'Piel y alergias', icon: 'Sparkles', hint: 'Erupciones, picazón, acné' },
  { id: 'sleep', label: 'Sueño y estrés', icon: 'Moon', hint: 'Insomnio, ansiedad leve' },
  { id: 'muscle', label: 'Dolor muscular', icon: 'Activity', hint: 'Espalda, cuello, articulaciones' },
  { id: 'other', label: 'Otro motivo', icon: 'Stethoscope', hint: 'Cuéntanos qué sientes' },
]

const commonQuestions: TriageQuestion[] = [
  {
    id: 'duration',
    text: '¿Desde cuándo tienes este malestar?',
    options: [
      { id: 'today', label: 'Desde hoy', weight: 0 },
      { id: 'days', label: 'Hace 2 a 3 días', weight: 1 },
      { id: 'week', label: 'Más de una semana', weight: 2 },
    ],
  },
  {
    id: 'intensity',
    text: '¿Qué tan fuerte es la molestia?',
    options: [
      { id: 'mild', label: 'Leve, puedo hacer mi día', weight: 0 },
      { id: 'moderate', label: 'Moderada, me limita', weight: 1 },
      { id: 'severe', label: 'Intensa, no la soporto', weight: 3 },
    ],
  },
  {
    id: 'alarm',
    text: '¿Presentas alguno de estos síntomas de alarma?',
    options: [
      { id: 'none', label: 'Ninguno', weight: 0 },
      { id: 'breathing', label: 'Dificultad para respirar o dolor de pecho', weight: 10, redFlag: true },
      { id: 'faint', label: 'Desmayo, confusión o debilidad de un lado', weight: 10, redFlag: true },
    ],
  },
]

export const questionsBySymptom: Record<string, TriageQuestion[]> = Object.fromEntries(
  symptoms.map((s) => [s.id, commonQuestions]),
)

const ALL_WEEK = [0, 1, 2, 3, 4, 5, 6]
const svc = (id: string, name: string, durationMin: number, price: number) => ({ id, name, durationMin, price })

/** Profesionales de ejemplo del entorno mock. La UI nunca los referencia directamente. */
const featuredDoctors: Doctor[] = [
  { id: 'd1', name: 'Dra. Valeria Quispe', specialty: 'Medicina general', cmp: '78421', verified: true, rating: 4.9, reviews: 1284, price: 35, etaMinutes: 3, online: true, languages: ['Español', 'Quechua'], avatarHue: 165, bio: 'Atención primaria y seguimiento de cuadros comunes con enfoque preventivo. Me gusta explicar con calma cada indicación para que sigas tu tratamiento con confianza.', yearsExperience: 11, education: ['Médico Cirujano · Universidad Nacional Mayor de San Marcos', 'Diplomado en Telemedicina · UPCH'], services: [svc('s1', 'Teleconsulta general', 30, 35), svc('s2', 'Seguimiento de tratamiento', 15, 20), svc('s3', 'Receta y certificado digital', 10, 15)], availability: { days: ALL_WEEK, startHour: 9, endHour: 21 }, joinedAt: '2025-02-10T00:00:00Z' },
  { id: 'd2', name: 'Dr. Mateo Salazar', specialty: 'Medicina interna', cmp: '66310', verified: true, rating: 4.8, reviews: 932, price: 45, etaMinutes: 5, online: true, languages: ['Español', 'Inglés'], avatarHue: 230, bio: 'Experiencia en cefaleas, gastritis y manejo de enfermedades crónicas como hipertensión y diabetes tipo 2.', yearsExperience: 15, education: ['Médico Cirujano · Universidad Peruana Cayetano Heredia', 'Residencia en Medicina Interna · Hospital Rebagliati'], services: [svc('s1', 'Teleconsulta de medicina interna', 30, 45), svc('s2', 'Control de enfermedad crónica', 20, 35)], availability: { days: [1, 2, 3, 4, 5], startHour: 10, endHour: 19 }, joinedAt: '2025-03-04T00:00:00Z' },
  { id: 'd3', name: 'Dra. Camila Herrera', specialty: 'Dermatología', cmp: '70215', verified: true, rating: 4.9, reviews: 611, price: 55, etaMinutes: 8, online: true, languages: ['Español'], avatarHue: 20, bio: 'Piel, alergias y cuidado dermatológico a distancia. Puedes enviarme fotos para una evaluación más precisa.', yearsExperience: 9, education: ['Médico Cirujano · Universidad de San Martín de Porres', 'Especialidad en Dermatología · Instituto Nacional de Salud'], services: [svc('s1', 'Teleconsulta dermatológica', 30, 55), svc('s2', 'Revisión de lesión con fotos', 15, 40)], availability: { days: [2, 3, 4, 5, 6], startHour: 9, endHour: 17 }, joinedAt: '2025-05-19T00:00:00Z' },
  { id: 'd4', name: 'Lic. Andrés Villanueva', specialty: 'Psicología clínica', cmp: '31872', verified: true, rating: 4.7, reviews: 405, price: 50, etaMinutes: 12, online: true, languages: ['Español', 'Inglés'], avatarHue: 285, bio: 'Estrés, ansiedad leve y hábitos de sueño, con herramientas prácticas basadas en terapia cognitivo-conductual.', yearsExperience: 7, education: ['Licenciado en Psicología · PUCP', 'Maestría en Psicología Clínica · UNMSM'], services: [svc('s1', 'Sesión de psicología', 45, 50), svc('s2', 'Primera orientación', 20, 25)], availability: { days: [1, 2, 3, 4, 5], startHour: 14, endHour: 21 }, joinedAt: '2025-07-01T00:00:00Z' },
  { id: 'd5', name: 'Dra. Renata Campos', specialty: 'Pediatría', cmp: '81044', verified: true, rating: 4.9, reviews: 758, price: 50, etaMinutes: 0, online: false, languages: ['Español'], avatarHue: 330, bio: 'Salud infantil, vacunas y control de crecimiento a distancia, con acompañamiento a madres, padres y cuidadores.', yearsExperience: 12, education: ['Médico Cirujano · Universidad Nacional de Trujillo', 'Especialidad en Pediatría · Instituto Nacional de Salud del Niño'], services: [svc('s1', 'Teleconsulta pediátrica', 30, 50), svc('s2', 'Control de crecimiento', 20, 40)], availability: { days: [1, 2, 3, 4, 5, 6], startHour: 8, endHour: 14 }, joinedAt: '2025-09-12T00:00:00Z' },
]


// --- Pool procedural de profesionales independientes (simula un marketplace con oferta amplia) ---
const rng = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
const FIRST_F = ['Lucía', 'Paola', 'Karen', 'Daniela', 'Fiorella', 'Mariana', 'Sofía', 'Gabriela', 'Rocío', 'Alejandra', 'Natalia', 'Carolina', 'Ximena', 'Pilar']
const FIRST_M = ['Diego', 'Rodrigo', 'Javier', 'Sebastián', 'Gonzalo', 'Álvaro', 'Fernando', 'Nicolás', 'Renzo', 'Marco', 'Luis', 'Percy', 'Iván', 'Bruno']
const LAST = ['Ramírez', 'Flores', 'Torres', 'Castillo', 'Mendoza', 'Rojas', 'Vargas', 'Chávez', 'Paredes', 'Delgado', 'Cáceres', 'Ponce', 'Arana', 'Bustamante', 'Cornejo', 'Lozano', 'Medina', 'Ortiz', 'Zevallos', 'Huamán']
const UNIS = ['Universidad Peruana Cayetano Heredia', 'Universidad de San Martín de Porres', 'Universidad Nacional de San Agustín', 'Universidad Peruana de Ciencias Aplicadas', 'Universidad Nacional Mayor de San Marcos', 'Universidad Privada Antenor Orrego']
const SPEC_POOL: { specialty: string; title: 'Dr./Dra.' | 'Lic.'; base: number; service: string }[] = [
  { specialty: 'Medicina general', title: 'Dr./Dra.', base: 35, service: 'Teleconsulta general' },
  { specialty: 'Medicina general', title: 'Dr./Dra.', base: 30, service: 'Teleconsulta general' },
  { specialty: 'Pediatría', title: 'Dr./Dra.', base: 50, service: 'Teleconsulta pediátrica' },
  { specialty: 'Dermatología', title: 'Dr./Dra.', base: 55, service: 'Teleconsulta dermatológica' },
  { specialty: 'Ginecología', title: 'Dr./Dra.', base: 60, service: 'Teleconsulta ginecológica' },
  { specialty: 'Cardiología', title: 'Dr./Dra.', base: 70, service: 'Teleconsulta cardiológica' },
  { specialty: 'Nutrición', title: 'Lic.', base: 45, service: 'Consulta nutricional' },
  { specialty: 'Psicología clínica', title: 'Lic.', base: 50, service: 'Sesión de psicología' },
  { specialty: 'Traumatología', title: 'Dr./Dra.', base: 60, service: 'Teleconsulta traumatológica' },
  { specialty: 'Medicina interna', title: 'Dr./Dra.', base: 45, service: 'Teleconsulta de medicina interna' },
]
const SCHEDULES: Availability[] = [
  { days: [1, 2, 3, 4, 5], startHour: 8, endHour: 14 }, { days: [1, 2, 3, 4, 5], startHour: 14, endHour: 21 },
  { days: [1, 3, 5, 6], startHour: 9, endHour: 18 }, { days: ALL_WEEK, startHour: 10, endHour: 20 },
  { days: [2, 4, 6, 0], startHour: 12, endHour: 22 }, { days: [1, 2, 3, 4, 5, 6], startHour: 7, endHour: 13 },
]

export const generateProfessionals = (count: number): Doctor[] => {
  const r = rng(20261013)
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)]
  const used = new Set<string>()
  const out: Doctor[] = []
  for (let i = 0; out.length < count; i++) {
    const female = r() < 0.55
    const spec = pick(SPEC_POOL)
    const first = pick(female ? FIRST_F : FIRST_M)
    const last = pick(LAST)
    const name = `${spec.title === 'Lic.' ? 'Lic.' : female ? 'Dra.' : 'Dr.'} ${first} ${last}`
    if (used.has(name)) continue
    used.add(name)
    const price = Math.round((spec.base + Math.floor(r() * 5) * 5 - 5) / 5) * 5
    const years = 2 + Math.floor(r() * 22)
    const fresh = r() < 0.12
    out.push({
      id: `g${String(out.length + 1).padStart(2, '0')}`, name, specialty: spec.specialty, cmp: String(20000 + Math.floor(r() * 70000)), verified: true,
      rating: fresh ? 0 : Math.round((4.3 + r() * 0.7) * 10) / 10, reviews: fresh ? 0 : 12 + Math.floor(r() * 700), price,
      etaMinutes: 2 + Math.floor(r() * 14), online: r() < 0.55, languages: r() < 0.25 ? ['Español', 'Inglés'] : ['Español'], avatarHue: Math.floor(r() * 360),
      bio: `${spec.specialty} con ${years} años de práctica. Atiendo a distancia con un enfoque cercano, claro y basado en evidencia.`,
      yearsExperience: years, education: [`Médico Cirujano · ${pick(UNIS)}`],
      services: [svc('s1', spec.service, 30, price), svc('s2', 'Seguimiento', 15, Math.max(15, Math.round(price * 0.6)))],
      availability: pick(SCHEDULES), joinedAt: new Date(Date.UTC(2024 + Math.floor(r() * 2), Math.floor(r() * 12), 1 + Math.floor(r() * 27))).toISOString(),
    })
  }
  return out
}

export const doctors: Doctor[] = [...featuredDoctors, ...generateProfessionals(48)]

export const specialties = ['Medicina general', 'Medicina interna', 'Pediatría', 'Dermatología', 'Psicología clínica', 'Ginecología', 'Cardiología', 'Nutrición', 'Traumatología', 'Otra']

export const clinics: Clinic[] = [
  { id: 'c1', name: 'Clínica Bellavista', district: 'Miraflores', distanceKm: 1.8, specialties: ['Emergencias', 'Laboratorio', 'Imágenes'], openNow: true, rating: 4.7, nextSlot: 'Hoy 16:30', partnerDiscount: 0.15 },
  { id: 'c2', name: 'Centro Médico San Isidro', district: 'San Isidro', distanceKm: 3.2, specialties: ['Medicina interna', 'Cardiología'], openNow: true, rating: 4.8, nextSlot: 'Hoy 18:00', partnerDiscount: 0.2 },
  { id: 'c3', name: 'Clínica del Sur', district: 'Surco', distanceKm: 5.6, specialties: ['Pediatría', 'Traumatología'], openNow: false, rating: 4.5, nextSlot: 'Mañana 09:15', partnerDiscount: 0.1 },
]

export const coupons: Coupon[] = [
  { id: 'cp1', code: 'BIENVENIDA20', title: '20% en tu primera consulta', description: 'Válido para teleconsultas de medicina general.', percent: 0.2, unlockLevel: 1, expiresAt: '2026-12-31', state: 'available' },
  { id: 'cp2', code: 'BROTE10', title: '10% por llegar a Brote', description: 'Un regalo por mantener tu hábito de cuidarte.', percent: 0.1, unlockLevel: 2, expiresAt: '2026-12-31', state: 'available' },
  { id: 'cp3', code: 'ROBLE25', title: '25% en consultas', description: 'Desbloquea al llegar al nivel Roble.', percent: 0.25, unlockLevel: 5, expiresAt: '2027-03-31', state: 'locked' },
]

export const promos: Promo[] = [
  { id: 'p1', title: '20% en tu primera consulta', subtitle: 'Usa el código BIENVENIDA20', cta: 'Canjear', tone: 'mint' },
  { id: 'p2', title: 'Invita y ganen S/ 15', subtitle: 'Tú y tu familiar reciben crédito', cta: 'Invitar', tone: 'lavender' },
  { id: 'p3', title: 'Racha de 7 días', subtitle: 'Gana un cupón sorpresa', cta: 'Ver misión', tone: 'peach' },
]

export const missionsSeed: Mission[] = [
  { id: 'm1', title: 'Hidrátate', description: 'Registra 6 vasos de agua hoy', icon: 'Droplets', xp: 20, progress: 4, target: 6, claimed: false },
  { id: 'm2', title: 'Camina 20 min', description: 'Muévete un poco hoy', icon: 'Footprints', xp: 30, progress: 1, target: 1, claimed: false },
  { id: 'm3', title: 'Duerme bien', description: 'Registra 7 h de sueño', icon: 'Moon', xp: 25, progress: 0, target: 1, claimed: false },
]

export const badgesSeed: Badge[] = [
  { id: 'b1', title: 'Primer paso', description: 'Completa tu perfil de salud', icon: 'Footprints', unlocked: true },
  { id: 'b2', title: 'Constante', description: 'Racha de 7 días', icon: 'Flame', unlocked: false },
  { id: 'b3', title: 'Atento', description: 'Completa un tratamiento', icon: 'ShieldCheck', unlocked: false },
  { id: 'b4', title: 'Familia', description: 'Agrega un familiar', icon: 'Users', unlocked: false },
]

export const profileSeed: Profile = {
  id: 'u1', firstName: 'Lucía', lastName: 'Ramos', phone: '+51 987 654 321', email: 'lucia@ejemplo.pe',
  birthDate: '1994-05-12', allergies: ['Penicilina'], conditions: [], dependents: [], onboarded: false,
}

export const levels = [
  { name: 'Semilla', min: 0 },
  { name: 'Brote', min: 100 },
  { name: 'Hoja', min: 250 },
  { name: 'Tallo', min: 500 },
  { name: 'Roble', min: 900 },
]
