import { sleep } from '@/lib/utils'
import type { Appointment, Consultation, Doctor, DoctorReviews, MediCallApi, Urgency, Wellness } from '../types'
import { getDb, saveDb, todayKey } from './db'
import { clinics, coupons, doctors as seedDoctors, levels, promos, questionsBySymptom, specialties, symptoms } from './seed'

/** Simula latencia de red y fallas ocasionales controladas por `window.__MEDICALL_MOCK__`. */
let latencyScale = 1
/** Escala la latencia simulada (los tests la reducen a ~0). */
export const setLatencyScale = (scale: number) => { latencyScale = scale }
const latency = async (ms = 350) => {
  await sleep((ms + Math.random() * 250) * latencyScale)
}

const MATCH_DELAY_MS = 3500

const computeWellness = (): Wellness => {
  const db = getDb()
  const idx = levels.findLastIndex((l) => db.xp >= l.min)
  const current = levels[idx]
  const next = levels[idx + 1]
  const set = new Set(db.checkIns)

  let streak = 0
  const cursor = new Date()
  if (!set.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (set.has(todayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  const monday = new Date()
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  const weekCheckIns = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return set.has(todayKey(d))
  })

  // Insignia "Constante" derivada de la racha
  const b2 = db.badges.find((b) => b.id === 'b2')
  if (b2 && streak >= 7) b2.unlocked = true

  return {
    xp: db.xp,
    level: idx + 1,
    levelName: current.name,
    xpIntoLevel: db.xp - current.min,
    xpForNextLevel: next ? next.min - current.min : 0,
    streak,
    checkedInToday: set.has(todayKey()),
    weekCheckIns,
    missions: structuredClone(db.missions),
    badges: structuredClone(db.badges),
  }
}

const addXp = (amount: number) => {
  getDb().xp += amount
}

/** Avanza el estado de la búsqueda como lo haría el backend. */
const advance = (c: Consultation): Consultation => {
  if (c.status === 'searching' && Date.now() - new Date(c.createdAt).getTime() >= MATCH_DELAY_MS) {
    const pool = allDoctors().filter((d) => d.online)
    c.doctor = c.doctor ?? pool[Math.floor(Math.random() * pool.length)]
    c.price = c.doctor.price
    c.total = Math.max(0, c.price - c.discount)
    c.status = 'matched'
    saveDb()
  }
  return c
}

const findConsultation = (id: string) => {
  const c = getDb().consultations.find((x) => x.id === id)
  if (!c) throw new Error('Consulta no encontrada')
  return c
}

const urgencyCopy: Record<Urgency, { title: string; advice: string; path: 'teleconsult' | 'clinic' | 'emergency' }> = {
  low: { title: 'Puedes resolverlo por teleconsulta', advice: 'Un médico general puede orientarte en minutos.', path: 'teleconsult' },
  medium: { title: 'Te recomendamos una teleconsulta pronto', advice: 'Si el médico lo considera necesario, te derivará a una clínica aliada.', path: 'teleconsult' },
  high: { title: 'Conviene una evaluación presencial', advice: 'Puedes empezar con una teleconsulta o ir directo a una clínica aliada.', path: 'clinic' },
  emergency: { title: 'Busca atención de emergencia ahora', advice: 'Tus respuestas indican señales de alarma. Llama al 106 (SAMU) o acude a la emergencia más cercana.', path: 'emergency' },
}

export const SLOT_MINUTES = 30
const SLOT_LEAD_MIN = 5 // no se ofrecen horarios que empiezan en menos de 5 min
const JOIN_BEFORE_MIN = 10
const JOIN_AFTER_MIN = 60

const hashStr = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7)
const localDate = (key: string, h: number, m: number) => {
  const [y, mo, d] = key.split('-').map(Number)
  return new Date(y, mo - 1, d, h, m, 0, 0)
}

const VERIFY_DELAY_MS = 5000 // simula la revisión del CMP por parte del equipo

/** Aplica la verificación pendiente cuando ya pasó el tiempo de revisión. */
const settlePro = () => {
  const pro = getDb().pro
  if (pro && pro.verification === 'pending' && Date.now() - new Date(pro.submittedAt).getTime() >= VERIFY_DELAY_MS) {
    pro.verification = 'verified'
    pro.doctor.verified = true
    pro.doctor.online = pro.online
    saveDb()
  }
}

/** Directorio: profesionales de ejemplo + el perfil propio si ya fue verificado. */
const allDoctors = (): Doctor[] => {
  settlePro()
  const db = getDb()
  const mine = db.pro?.verification === 'verified' ? [{ ...db.pro.doctor, online: db.pro.online }] : []
  return [...seedDoctors, ...mine].map((d) => ({ ...d, isFavorite: db.favorites.includes(d.id) }))
}

const findDoctor = (id: string) => {
  const d = allDoctors().find((x) => x.id === id)
  if (!d) throw new Error('Médico no encontrado')
  return d
}

/** Horarios libres de un profesional en una fecha local: su agenda semanal menos lo ocupado. */
const freeSlots = (doc: Doctor, date: string): string[] => {
  const { days, startHour, endHour } = doc.availability
  if (!days.includes(localDate(date, 12, 0).getDay())) return []
  const taken = new Set(getDb().appointments.filter((a) => a.doctor.id === doc.id && a.status === 'scheduled').map((a) => a.startsAt))
  const minStart = Date.now() + SLOT_LEAD_MIN * 60_000
  const out: string[] = []
  for (let mins = startHour * 60; mins < endHour * 60; mins += SLOT_MINUTES) {
    const start = localDate(date, Math.floor(mins / 60), mins % 60)
    const iso = start.toISOString()
    const free = hashStr(`${doc.id}|${date}|${mins}`) % 4 !== 0 // ~25% ocupado por otros pacientes
    if (free && start.getTime() >= minStart && !taken.has(iso)) out.push(iso)
  }
  return out
}

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const AUTHORS = ['Camila R.', 'Jorge P.', 'María F.', 'Luis A.', 'Ana C.', 'Pedro S.', 'Rocío M.', 'Diego T.']
const COMMENTS: Record<'hi' | 'mid' | 'lo', string[]> = {
  hi: ['Muy atento y claro con las indicaciones. Resolvió mi duda en minutos.', 'Excelente atención, me sentí escuchado/a en todo momento.', 'Puntual y profesional. Lo recomiendo totalmente.', 'Me explicó el tratamiento paso a paso. Gran experiencia.'],
  mid: ['Buena atención, aunque la llamada empezó unos minutos tarde.', 'Resolvió mi consulta, esperaba un poco más de detalle.'],
  lo: ['La conexión falló un par de veces, pero la atención fue correcta.'],
}
const weightsFor = (avg: number): number[] => (avg >= 4.8 ? [0.01, 0.01, 0.03, 0.12, 0.83] : avg >= 4.6 ? [0.01, 0.02, 0.05, 0.2, 0.72] : [0.02, 0.03, 0.1, 0.28, 0.57])

const buildReviews = (d: Doctor): DoctorReviews => {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  if (d.reviews === 0) return { average: 0, total: 0, distribution: dist, items: [] }
  const w = weightsFor(d.rating)
  w.forEach((p, i) => { dist[(i + 1) as 1 | 2 | 3 | 4 | 5] = Math.round(p * d.reviews) })
  const items = Array.from({ length: 6 }, (_, k) => {
    const h = hashStr(`${d.id}|r|${k}`)
    const roll = (h % 1000) / 1000
    const rating = roll < w[4] ? 5 : roll < w[4] + w[3] ? 4 : 3
    const pool = rating === 5 ? COMMENTS.hi : rating === 4 ? COMMENTS.mid : COMMENTS.lo
    return {
      id: `${d.id}-rv${k}`, author: AUTHORS[h % AUTHORS.length], rating, comment: pool[(h >> 3) % pool.length],
      date: new Date(Date.now() - (k * 6 + 2 + (h % 4)) * 86_400_000).toISOString(),
    }
  })
  return { average: d.rating, total: d.reviews, distribution: dist, items }
}

/** Hash con avalancha (murmur-like): cambios pequeños en la entrada reordenan todo. */
const mix = (s: string) => {
  let h = 2166136261
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return (h ^ (h >>> 16)) >>> 0
}
const hueFromName = (s: string) => hashStr(s) % 360

const findAppointment = (id: string) => {
  const a = getDb().appointments.find((x) => x.id === id)
  if (!a) throw new Error('Cita no encontrada')
  return a
}

/** Marca como completadas las citas cuyo horario ya pasó con holgura. */
const settleAppointments = () => {
  const limit = Date.now() - JOIN_AFTER_MIN * 60_000
  for (const a of getDb().appointments) {
    if (a.status === 'scheduled' && !a.consultationId && new Date(a.startsAt).getTime() < limit) a.status = 'cancelled'
  }
}

export const mockApi: MediCallApi = {
  profile: {
    async get() {
      await latency(200)
      return structuredClone(getDb().profile)
    },
    async update(patch) {
      await latency()
      const db = getDb()
      db.profile = { ...db.profile, ...patch }
      saveDb()
      return structuredClone(db.profile)
    },
    async completeOnboarding(patch) {
      await latency()
      const db = getDb()
      db.profile = { ...db.profile, ...patch, onboarded: true }
      addXp(20)
      saveDb()
      return structuredClone(db.profile)
    },
  },

  catalog: {
    async symptoms() {
      await latency(200)
      return structuredClone(symptoms)
    },
    async promos() {
      await latency(250)
      return structuredClone(promos)
    },
  },

  triage: {
    async questions(symptomId) {
      await latency(250)
      return structuredClone(questionsBySymptom[symptomId] ?? questionsBySymptom.other)
    },
    async evaluate(symptomId, answers) {
      await latency(500)
      const qs = questionsBySymptom[symptomId] ?? questionsBySymptom.other
      let score = 0
      let red = false
      for (const q of qs) {
        const opt = q.options.find((o) => o.id === answers[q.id])
        if (opt) {
          score += opt.weight
          if (opt.redFlag) red = true
        }
      }
      const urgency: Urgency = red ? 'emergency' : score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low'
      const copy = urgencyCopy[urgency]
      return { urgency, title: copy.title, advice: copy.advice, recommendedPath: copy.path }
    },
  },

  doctors: {
    async list(filters = {}) {
      await latency(300)
      const { query, specialty, onlineOnly, favoritesOnly, sort = 'rating' } = filters
      const q = query ? norm(query.trim()) : ''
      const list = allDoctors().filter((d) =>
        (!q || norm(`${d.name} ${d.specialty} ${d.bio}`).includes(q)) &&
        (!specialty || d.specialty === specialty) &&
        (!onlineOnly || d.online) &&
        (!favoritesOnly || d.isFavorite))
      list.sort((a, b) =>
        sort === 'price' ? a.price - b.price || b.rating - a.rating
        : sort === 'online' ? Number(b.online) - Number(a.online) || b.rating - a.rating
        : b.rating - a.rating || b.reviews - a.reviews)
      return structuredClone(list)
    },
    async get(id) {
      await latency(200)
      return structuredClone(findDoctor(id))
    },
    async reviews(id) {
      await latency(250)
      return buildReviews(findDoctor(id))
    },
    async specialties() {
      await latency(100)
      const used = new Set(allDoctors().map((d) => d.specialty))
      return specialties.filter((s) => used.has(s))
    },
    async toggleFavorite(id) {
      await latency(150)
      const db = getDb()
      findDoctor(id)
      db.favorites = db.favorites.includes(id) ? db.favorites.filter((f) => f !== id) : [...db.favorites, id]
      saveDb()
      return structuredClone(findDoctor(id))
    },
  },

  pro: {
    async get() {
      await latency(200)
      settlePro()
      const pro = getDb().pro
      return pro ? structuredClone(pro) : null
    },
    async register(input) {
      await latency(700)
      const db = getDb()
      if (db.pro) throw new Error('Ya enviaste tu perfil profesional')
      if (!/^\d{4,6}$/.test(input.cmp.trim())) throw new Error('El número de colegiatura debe tener entre 4 y 6 dígitos')
      if (input.price < 15 || input.price > 400) throw new Error('La tarifa debe estar entre S/ 15 y S/ 400')
      if (input.availability.days.length === 0 || input.availability.endHour <= input.availability.startHour) throw new Error('Revisa tus días y horarios de atención')
      const p = db.profile
      const name = `${input.title} ${p.firstName} ${p.lastName}`
      const doctor: Doctor = {
        id: `dp_${p.id}`, name, specialty: input.specialty, cmp: input.cmp.trim(), verified: false, rating: 0, reviews: 0,
        price: input.price, etaMinutes: 5, online: false, languages: input.languages, avatarHue: hueFromName(name), bio: input.bio.trim(),
        yearsExperience: input.yearsExperience, education: input.education,
        services: [
          { id: 's1', name: 'Teleconsulta', durationMin: 30, price: input.price },
          { id: 's2', name: 'Seguimiento', durationMin: 15, price: Math.max(15, Math.round(input.price * 0.6)) },
        ],
        availability: input.availability, joinedAt: new Date().toISOString(),
      }
      db.pro = { doctor, verification: 'pending', submittedAt: new Date().toISOString(), online: false }
      saveDb()
      return structuredClone(db.pro)
    },
    async setOnline(online) {
      await latency(200)
      settlePro()
      const db = getDb()
      if (!db.pro) throw new Error('Aún no tienes perfil profesional')
      if (db.pro.verification !== 'verified') throw new Error('Podrás conectarte cuando verifiquemos tu colegiatura')
      db.pro.online = online
      db.pro.doctor.online = online
      saveDb()
      return structuredClone(db.pro)
    },
  },

  appointments: {
    async slots(doctorId, date) {
      await latency(250)
      return freeSlots(findDoctor(doctorId), date)
    },
    async search({ date, query, specialty, sort = 'fair', seed = '', pinId, offset = 0, limit = 8 }) {
      await latency(350)
      const q = query ? norm(query.trim()) : ''
      const rows = allDoctors()
        .filter((d) => d.verified && (!specialty || d.specialty === specialty) && (!q || norm(`${d.name} ${d.specialty} ${d.bio}`).includes(q)) || d.id === pinId)
        .map((doctor) => ({ doctor, slots: freeSlots(doctor, date) }))
        .filter((r) => r.slots.length > 0 || r.doctor.id === pinId)
      rows.sort((a, b) =>
        Number(b.doctor.id === pinId) - Number(a.doctor.id === pinId) ||
        (sort === 'price' ? a.doctor.price - b.doctor.price || b.doctor.rating - a.doctor.rating
        : sort === 'fair' ? mix(`${seed}|${a.doctor.id}`) - mix(`${seed}|${b.doctor.id}`)
        : sort === 'rating' ? b.doctor.rating - a.doctor.rating || b.doctor.reviews - a.doctor.reviews
        : (a.slots[0] ?? '~').localeCompare(b.slots[0] ?? '~') || b.doctor.rating - a.doctor.rating))
      return structuredClone({ items: rows.slice(offset, offset + limit), total: rows.length })
    },
    async list() {
      await latency(250)
      settleAppointments()
      saveDb()
      return structuredClone([...getDb().appointments].sort((a, b) => a.startsAt.localeCompare(b.startsAt)))
    },
    async book({ doctorId, startsAt, reason }) {
      await latency(600)
      const doctor = findDoctor(doctorId)
      if (new Date(startsAt).getTime() < Date.now()) throw new Error('Ese horario ya pasó')
      const db = getDb()
      if (db.appointments.some((a) => a.doctor.id === doctorId && a.startsAt === startsAt && a.status === 'scheduled')) {
        throw new Error('Ese horario acaba de ser reservado. Elige otro.')
      }
      const appt: Appointment = {
        id: `a_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
        doctor, startsAt, durationMin: SLOT_MINUTES, reason: reason.trim() || 'Consulta general', status: 'scheduled', price: doctor.price,
      }
      db.appointments.push(appt)
      addXp(10)
      saveDb()
      return structuredClone(appt)
    },
    async cancel(id) {
      await latency(300)
      const a = findAppointment(id)
      a.status = 'cancelled'
      saveDb()
      return structuredClone(a)
    },
    async join(id) {
      await latency(500)
      const db = getDb()
      const a = findAppointment(id)
      if (a.consultationId) return structuredClone(findConsultation(a.consultationId))
      if (a.status !== 'scheduled') throw new Error('Esta cita ya no está activa')
      const diffMin = (new Date(a.startsAt).getTime() - Date.now()) / 60_000
      if (diffMin > JOIN_BEFORE_MIN) throw new Error(`Podrás unirte ${JOIN_BEFORE_MIN} minutos antes de la hora`)
      if (diffMin < -JOIN_AFTER_MIN) throw new Error('El tiempo para unirte ya pasó')
      const c: Consultation = {
        id: `c_${Date.now().toString(36)}`, symptomId: 'other', symptomLabel: a.reason, status: 'matched', doctor: a.doctor,
        createdAt: new Date().toISOString(), price: a.price, discount: 0, total: a.price,
      }
      db.consultations.push(c)
      db.urgencies[c.id] = 'low'
      a.consultationId = c.id
      a.status = 'completed'
      saveDb()
      return structuredClone(c)
    },
  },

  consultations: {
    async list() {
      await latency(250)
      return structuredClone(
        getDb()
          .consultations.map(advance)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      )
    },
    async get(id) {
      await latency(120)
      return structuredClone(advance(findConsultation(id)))
    },
    async request({ symptomId, urgency, couponCode, doctorId }) {
      await latency(400)
      const db = getDb()
      const symptom = symptoms.find((s) => s.id === symptomId)
      if (!symptom) throw new Error('Síntoma inválido')
      const preferred = doctorId ? findDoctor(doctorId) : undefined
      if (preferred && !preferred.online) throw new Error(`${preferred.name} no está en línea ahora. Puedes agendar una cita.`)
      let percent = 0
      if (couponCode) {
        const cp = coupons.find((c) => c.code === couponCode.toUpperCase())
        if (!cp || db.usedCoupons.includes(cp.code)) throw new Error('Cupón inválido o ya utilizado')
        percent = cp.percent
        db.usedCoupons.push(cp.code)
      }
      const basePrice = preferred?.price ?? 35
      const c: Consultation = {
        id: `c_${Date.now().toString(36)}`,
        symptomId,
        symptomLabel: symptom.label,
        status: 'searching',
        doctor: preferred,
        createdAt: new Date().toISOString(),
        price: basePrice,
        discount: +(basePrice * percent).toFixed(2),
        total: +(basePrice * (1 - percent)).toFixed(2),
        couponCode: couponCode?.toUpperCase(),
      }
      db.consultations.push(c)
      db.urgencies[c.id] = urgency
      saveDb()
      return structuredClone(c)
    },
    async cancel(id) {
      await latency(200)
      const c = findConsultation(id)
      c.status = 'cancelled'
      saveDb()
      return structuredClone(c)
    },
    async start(id) {
      await latency(300)
      const c = advance(findConsultation(id))
      c.status = 'in_progress'
      saveDb()
      return structuredClone(c)
    },
    async finish(id) {
      await latency(500)
      const db = getDb()
      const c = findConsultation(id)
      const urgency = db.urgencies[id] ?? 'low'
      c.status = 'completed'
      c.notes = 'Cuadro compatible con proceso común. Reposo relativo, hidratación y control de síntomas por 48 h.'
      c.prescriptions = [
        { medication: 'Paracetamol 500 mg', dose: '1 tableta cada 8 horas si hay dolor o fiebre', duration: '3 días' },
        { medication: 'Suero oral', dose: 'Sorbos frecuentes durante el día', duration: '2 días' },
      ]
      if (urgency === 'high') {
        c.referral = { reason: 'Se recomienda evaluación presencial para descartar complicaciones.', clinicId: 'c1' }
      }
      c.xpEarned = 30
      addXp(30)
      db.transactions.unshift({ id: `t_${Date.now()}`, title: `Teleconsulta · ${c.symptomLabel}`, amount: -c.total, createdAt: new Date().toISOString() })
      saveDb()
      return structuredClone(c)
    },
    async rate(id, rating) {
      await latency(250)
      const c = findConsultation(id)
      c.rating = rating
      saveDb()
      return structuredClone(c)
    },
  },

  clinics: {
    async nearby() {
      await latency(350)
      return structuredClone(clinics)
    },
    async book(clinicId) {
      await latency(600)
      if (!clinics.some((c) => c.id === clinicId)) throw new Error('Clínica no encontrada')
      return { confirmationCode: `MC-${Math.random().toString(36).slice(2, 7).toUpperCase()}` }
    },
  },

  wallet: {
    async get() {
      await latency(250)
      const db = getDb()
      return {
        balance: db.balance,
        methods: [
          { id: 'pm1', kind: 'card', label: 'Visa', last4: '4242', isDefault: true },
          { id: 'pm2', kind: 'yape', label: 'Yape', isDefault: false },
        ],
        transactions: structuredClone(db.transactions),
      }
    },
    async coupons() {
      await latency(250)
      const db = getDb()
      const { level } = computeWellness()
      return coupons.map((c) => ({
        ...c,
        state: db.usedCoupons.includes(c.code) ? ('used' as const) : level >= c.unlockLevel ? ('available' as const) : ('locked' as const),
      }))
    },
    async validateCoupon(code) {
      await latency(300)
      const db = getDb()
      const cp = coupons.find((c) => c.code === code.trim().toUpperCase())
      if (!cp) throw new Error('El cupón no existe')
      if (db.usedCoupons.includes(cp.code)) throw new Error('Este cupón ya fue utilizado')
      if (computeWellness().level < cp.unlockLevel) throw new Error('Aún no desbloqueas este cupón')
      return { ...cp, state: 'available' }
    },
  },

  wellness: {
    async get() {
      await latency(250)
      return computeWellness()
    },
    async checkIn() {
      await latency(300)
      const db = getDb()
      if (!db.checkIns.includes(todayKey())) {
        db.checkIns.push(todayKey())
        addXp(10)
        saveDb()
      }
      return computeWellness()
    },
    async claimMission(id) {
      await latency(300)
      const db = getDb()
      const m = db.missions.find((x) => x.id === id)
      if (!m) throw new Error('Misión no encontrada')
      if (m.progress < m.target) throw new Error('Aún no completas esta misión')
      if (!m.claimed) {
        m.claimed = true
        addXp(m.xp)
        saveDb()
      }
      return computeWellness()
    },
  },
}
