import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildIcs } from '@/lib/ics'
import { mockApi as api } from './client'
import { resetDb, todayKey } from './db'

beforeEach(() => {
  resetDb()
  vi.useFakeTimers({ toFake: ['Date'] }) // solo el reloj: la latencia simulada sigue usando timers reales
  vi.setSystemTime(new Date(2026, 9, 14, 10, 0, 0)) // 14 oct 2026, 10:00 hora local
})
afterEach(() => vi.useRealTimers())

const day = () => todayKey()

describe('agenda de teleconsultas', () => {
  it('ofrece solo horarios futuros dentro del horario de atención', async () => {
    const slots = await api.appointments.slots('d1', day())
    expect(slots.length).toBeGreaterThan(0)
    for (const s of slots) {
      const t = new Date(s)
      expect(t.getTime()).toBeGreaterThanOrEqual(Date.now())
      expect(t.getHours()).toBeGreaterThanOrEqual(9)
      expect(t.getHours()).toBeLessThan(21)
    }
  })

  it('al reservar, el horario deja de estar disponible y no permite doble reserva', async () => {
    const [first] = await api.appointments.slots('d1', day())
    const appt = await api.appointments.book({ doctorId: 'd1', startsAt: first, reason: 'Fiebre' })
    expect(appt.status).toBe('scheduled')
    expect(await api.appointments.slots('d1', day())).not.toContain(first)
    await expect(api.appointments.book({ doctorId: 'd1', startsAt: first, reason: '' })).rejects.toThrow('reservado')
  })

  it('rechaza horarios pasados y médicos inexistentes', async () => {
    await expect(api.appointments.book({ doctorId: 'd1', startsAt: new Date(2026, 9, 14, 8, 0).toISOString(), reason: '' })).rejects.toThrow('ya pasó')
    await expect(api.appointments.slots('zzz', day())).rejects.toThrow()
  })

  it('solo permite unirse 10 min antes y convierte la cita en consulta', async () => {
    const slots = await api.appointments.slots('d2', day())
    const target = slots.find((s) => new Date(s).getTime() - Date.now() > 20 * 60_000)!
    const appt = await api.appointments.book({ doctorId: 'd2', startsAt: target, reason: 'Gastritis' })
    await expect(api.appointments.join(appt.id)).rejects.toThrow('10 minutos')

    vi.setSystemTime(new Date(new Date(target).getTime() - 5 * 60_000))
    const c = await api.appointments.join(appt.id)
    expect(c.status).toBe('matched')
    expect(c.doctor?.id).toBe('d2')
    // idempotente: unirse otra vez devuelve la misma consulta
    expect((await api.appointments.join(appt.id)).id).toBe(c.id)
  })

  it('permite cancelar y libera el horario', async () => {
    const [first] = await api.appointments.slots('d3', day())
    const a = await api.appointments.book({ doctorId: 'd3', startsAt: first, reason: '' })
    await api.appointments.cancel(a.id)
    expect(await api.appointments.slots('d3', day())).toContain(first)
  })
})

describe('ics', () => {
  it('genera un evento válido con alarma y caracteres escapados', async () => {
    const [first] = await api.appointments.slots('d1', day())
    const a = await api.appointments.book({ doctorId: 'd1', startsAt: first, reason: 'Tos, fiebre; malestar' })
    const ics = buildIcs(a)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VEVENT')
    expect(ics).toContain('Tos\\, fiebre\\; malestar')
    expect(ics).toMatch(/DTSTART:\d{8}T\d{6}Z/)
    expect(ics).toContain('TRIGGER:-PT15M')
  })

  it('search: lista a los profesionales con cupos, filtra, ordena, pagina y fija a uno', async () => {
    const d = day()
    const first = await api.appointments.search({ date: d, seed: 'x', limit: 5 })
    expect(first.total).toBeGreaterThan(20)
    expect(first.items).toHaveLength(5)
    expect(first.items.every((r) => r.slots.length > 0)).toBe(true)
    const soonest = await api.appointments.search({ date: d, sort: 'soonest', limit: 50 })
    const soon = soonest.items.map((r) => r.slots[0])
    expect([...soon].sort()).toEqual(soon)

    // orden por defecto: rotación equitativa, estable por semilla y distinta entre semillas
    const ids = async (seed: string) => (await api.appointments.search({ date: d, seed, limit: 50 })).items.map((r) => r.doctor.id)
    expect(await ids('a')).toEqual(await ids('a'))
    expect(await ids('a')).not.toEqual(await ids('b'))
    expect(await ids('a')).not.toEqual(soonest.items.map((r) => r.doctor.id))

    const page2 = await api.appointments.search({ date: d, seed: 'x', limit: 5, offset: 5 })
    expect(page2.items.some((r) => first.items.some((f) => f.doctor.id === r.doctor.id))).toBe(false)

    const peds = await api.appointments.search({ date: d, specialty: 'Pediatría', limit: 50 })
    expect(peds.items.length).toBeGreaterThan(0)
    expect(peds.items.every((r) => r.doctor.specialty === 'Pediatría')).toBe(true)

    const cheap = await api.appointments.search({ date: d, sort: 'price', limit: 50 })
    for (let i = 1; i < cheap.items.length; i++) expect(cheap.items[i - 1].doctor.price).toBeLessThanOrEqual(cheap.items[i].doctor.price)

    expect((await api.appointments.search({ date: d, query: 'zzzz' })).items).toEqual([])
    const pinned = await api.appointments.search({ date: d, specialty: 'Pediatría', pinId: 'd1', limit: 3 })
    expect(pinned.items[0].doctor.id).toBe('d1')
  })
})
