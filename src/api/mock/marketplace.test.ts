import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProRegisterInput } from '../types'
import { mockApi as api } from './client'
import { resetDb } from './db'

beforeEach(() => {
  resetDb()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 14, 10, 0, 0)) // miércoles
})
afterEach(() => vi.useRealTimers())

const input: ProRegisterInput = {
  title: 'Dra.', specialty: 'Nutrición', cmp: '90123', yearsExperience: 6, price: 60,
  bio: 'Nutricionista clínica enfocada en hábitos sostenibles y planes personalizados para cada paciente.',
  languages: ['Español'], education: ['Lic. en Nutrición · UNMSM'], availability: { days: [1, 2, 3], startHour: 10, endHour: 14 },
}

describe('directorio de profesionales', () => {
  it('ordena por calificación y filtra por especialidad, estado y texto sin importar tildes', async () => {
    const all = await api.doctors.list()
    expect(all.length).toBeGreaterThan(30) // oferta amplia, no una lista corta
    for (let i = 1; i < all.length; i++) expect(all[i - 1].rating).toBeGreaterThanOrEqual(all[i].rating)

    expect((await api.doctors.list({ onlineOnly: true })).every((d) => d.online)).toBe(true)
    expect((await api.doctors.list({ specialty: 'Pediatría' })).every((d) => d.specialty === 'Pediatría')).toBe(true)
    expect((await api.doctors.list({ query: 'pediatria' })).map((d) => d.id)).toContain('d5')
    expect(await api.doctors.list({ query: 'zzzz' })).toEqual([])
    const byPrice = await api.doctors.list({ sort: 'price' })
    expect(byPrice[0].price).toBeLessThanOrEqual(byPrice[byPrice.length - 1].price)
  })

  it('guarda y quita favoritos, y permite filtrarlos', async () => {
    expect((await api.doctors.toggleFavorite('d3')).isFavorite).toBe(true)
    expect((await api.doctors.list({ favoritesOnly: true })).map((d) => d.id)).toEqual(['d3'])
    expect((await api.doctors.toggleFavorite('d3')).isFavorite).toBe(false)
    expect(await api.doctors.list({ favoritesOnly: true })).toEqual([])
  })

  it('devuelve perfil, reseñas coherentes y error para ids inexistentes', async () => {
    const d = await api.doctors.get('d1')
    expect(d.verified).toBe(true)
    expect(d.services.length).toBeGreaterThan(0)
    const r = await api.doctors.reviews('d1')
    expect(r.total).toBe(d.reviews)
    expect(r.items.length).toBeGreaterThan(0)
    expect(r.items.every((x) => x.rating >= 3 && x.rating <= 5)).toBe(true)
    const sum = Object.values(r.distribution).reduce((a, b) => a + b, 0)
    expect(Math.abs(sum - r.total)).toBeLessThanOrEqual(5)
    await expect(api.doctors.get('nope')).rejects.toThrow('no encontrado')
  })

  it('respeta la disponibilidad semanal propia de cada profesional', async () => {
    // Dra. Camila (d3) atiende martes a sábado: el domingo 18 de octubre no tiene horarios
    expect(await api.appointments.slots('d3', '2026-10-18')).toEqual([])
    expect((await api.appointments.slots('d3', '2026-10-20')).length).toBeGreaterThan(0)
  })
})

describe('alta de profesionales independientes', () => {
  it('valida los datos antes de crear el perfil', async () => {
    await expect(api.pro.register({ ...input, cmp: '12' })).rejects.toThrow('colegiatura')
    await expect(api.pro.register({ ...input, price: 5 })).rejects.toThrow('tarifa')
    await expect(api.pro.register({ ...input, availability: { days: [], startHour: 9, endHour: 12 } })).rejects.toThrow('horarios')
    expect(await api.pro.get()).toBeNull()
  })

  it('queda en revisión, se verifica con el tiempo y recién entonces aparece en el directorio', async () => {
    const before = (await api.doctors.list()).length
    const pro = await api.pro.register(input)
    expect(pro.verification).toBe('pending')
    expect(pro.doctor.name).toContain('Dra.')
    expect((await api.doctors.list()).length).toBe(before) // aún no es público
    await expect(api.pro.setOnline(true)).rejects.toThrow('verifiquemos')
    await expect(api.pro.register(input)).rejects.toThrow('Ya enviaste')

    vi.setSystemTime(new Date(2026, 9, 14, 10, 0, 10))
    expect((await api.pro.get())?.verification).toBe('verified')
    const list = await api.doctors.list()
    expect(list.length).toBe(before + 1)
    const mine = list.find((d) => d.id === pro.doctor.id)!
    expect(mine.reviews).toBe(0)
    expect((await api.doctors.reviews(mine.id)).items).toEqual([])
    expect((await api.doctors.list({ onlineOnly: true })).some((d) => d.id === mine.id)).toBe(false)

    await api.pro.setOnline(true)
    expect((await api.doctors.list({ onlineOnly: true })).some((d) => d.id === mine.id)).toBe(true)
  })

  it('un paciente puede agendar con un profesional recién verificado según su horario', async () => {
    const pro = await api.pro.register(input)
    vi.setSystemTime(new Date(2026, 9, 14, 10, 0, 10))
    await api.pro.get()
    expect(await api.appointments.slots(pro.doctor.id, '2026-10-17')).toEqual([]) // sábado: no atiende
    const slots = await api.appointments.slots(pro.doctor.id, '2026-10-19') // lunes
    expect(slots.length).toBeGreaterThan(0)
    for (const s of slots) { const h = new Date(s).getHours(); expect(h).toBeGreaterThanOrEqual(10); expect(h).toBeLessThan(14) }
    const appt = await api.appointments.book({ doctorId: pro.doctor.id, startsAt: slots[0], reason: 'Plan nutricional' })
    expect(appt.price).toBe(60)
  })

  it('una consulta inmediata con un médico específico exige que esté en línea', async () => {
    await expect(api.consultations.request({ symptomId: 'fever', urgency: 'low', doctorId: 'd5' })).rejects.toThrow('no está en línea')
    const c = await api.consultations.request({ symptomId: 'fever', urgency: 'low', doctorId: 'd2' })
    expect(c.doctor?.id).toBe('d2')
    expect(c.price).toBe(45)
  })
})
