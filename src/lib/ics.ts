import type { Appointment } from '@/api/types'

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/[;,]/g, '\\$&').replace(/\n/g, '\\n')

/** Genera un archivo iCalendar (.ics) para añadir la cita a cualquier calendario. */
export function buildIcs(a: Appointment): string {
  const start = new Date(a.startsAt)
  const end = new Date(start.getTime() + a.durationMin * 60_000)
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MediCall//Teleconsulta//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${a.id}@medicall.pe`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(`Teleconsulta con ${a.doctor.name}`)}`,
    `DESCRIPTION:${esc(`${a.doctor.specialty} · Motivo: ${a.reason}. Abre MediCall 10 minutos antes para unirte.`)}`,
    'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:Tu teleconsulta empieza pronto', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadIcs(a: Appointment) {
  const url = URL.createObjectURL(new Blob([buildIcs(a)], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `teleconsulta-${a.id}.ics`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
