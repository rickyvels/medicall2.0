import type { Appointment, Consultation, ProProfile, Profile, Transaction, Urgency } from '../types'
import { badgesSeed, missionsSeed, profileSeed } from './seed'

export interface MockDb {
  profile: Profile
  xp: number
  checkIns: string[] // fechas ISO yyyy-mm-dd
  missions: typeof missionsSeed
  badges: typeof badgesSeed
  consultations: Consultation[]
  appointments: Appointment[]
  pro: ProProfile | null
  favorites: string[]
  urgencies: Record<string, Urgency>
  usedCoupons: string[]
  balance: number
  transactions: Transaction[]
}

const KEY = 'medicall.mock.db.v1'

const fresh = (): MockDb => ({
  profile: structuredClone(profileSeed),
  xp: 40,
  checkIns: [],
  missions: structuredClone(missionsSeed),
  badges: structuredClone(badgesSeed),
  consultations: [],
  appointments: [],
  pro: null,
  favorites: [],
  urgencies: {},
  usedCoupons: [],
  balance: 15,
  transactions: [{ id: 't0', title: 'Crédito de bienvenida', amount: 15, createdAt: new Date().toISOString() }],
})

let db: MockDb | null = null

export const getDb = (): MockDb => {
  if (db) return db
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      db = { ...fresh(), ...(JSON.parse(raw) as Partial<MockDb>) } // tolera versiones previas del esquema
      return db
    }
  } catch {
    /* almacenamiento no disponible: seguimos en memoria */
  }
  db = fresh()
  return db
}

export const saveDb = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    /* noop */
  }
}

export const resetDb = () => {
  db = fresh()
  saveDb()
}

/** Fecha local yyyy-mm-dd (no UTC: en Lima el día cambia a medianoche local). */
export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
