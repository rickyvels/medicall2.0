import { beforeEach, describe, expect, it } from 'vitest'
import { mockApi as api } from './client'
import { resetDb } from './db'

beforeEach(() => resetDb())

describe('triage', () => {
  it('marca emergencia ante señales de alarma', async () => {
    const r = await api.triage.evaluate('fever', { duration: 'today', intensity: 'mild', alarm: 'breathing' })
    expect(r.urgency).toBe('emergency')
    expect(r.recommendedPath).toBe('emergency')
  })
  it('clasifica cuadros leves como teleconsulta', async () => {
    const r = await api.triage.evaluate('headache', { duration: 'today', intensity: 'mild', alarm: 'none' })
    expect(r.urgency).toBe('low')
  })
})

describe('wellness', () => {
  it('check-in suma XP una sola vez por día y arma la racha', async () => {
    const before = await api.wellness.get()
    const after = await api.wellness.checkIn()
    const again = await api.wellness.checkIn()
    expect(after.xp).toBe(before.xp + 10)
    expect(again.xp).toBe(after.xp)
    expect(after.streak).toBe(1)
  })
  it('no permite reclamar misiones incompletas', async () => {
    await expect(api.wellness.claimMission('m3')).rejects.toThrow()
  })
})

describe('cupones y consultas', () => {
  it('rechaza cupones inexistentes y aplica descuento válido', async () => {
    await expect(api.wallet.validateCoupon('NOPE')).rejects.toThrow('no existe')
    const c = await api.consultations.request({ symptomId: 'headache', urgency: 'low', couponCode: 'BIENVENIDA20' })
    expect(c.discount).toBeCloseTo(7)
    expect(c.total).toBeCloseTo(28)
    await expect(api.consultations.request({ symptomId: 'headache', urgency: 'low', couponCode: 'BIENVENIDA20' })).rejects.toThrow()
  })
  it('deriva a clínica cuando la urgencia es alta', async () => {
    const c = await api.consultations.request({ symptomId: 'fever', urgency: 'high' })
    const done = await api.consultations.finish(c.id)
    expect(done.referral).toBeDefined()
    expect(done.status).toBe('completed')
  })
})
