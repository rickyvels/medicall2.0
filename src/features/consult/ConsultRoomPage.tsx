import { MessageSquare, Mic, MicOff, PhoneOff, Send, Video, VideoOff } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useConsultation, useFinishConsultation } from '@/api/hooks'
import { Avatar } from '@/components/ui/avatar'
import { Sheet } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useLocalCamera } from './useLocalCamera'

interface Msg { id: number; from: 'me' | 'doctor'; text: string }

const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

const ctrl = 'grid size-14 place-items-center rounded-full transition active:scale-95'

export default function ConsultRoomPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const { data: c } = useConsultation(id)
  const finish = useFinishConsultation()
  const [cam, setCam] = useState(true)
  const [mic, setMic] = useState(true)
  const [chat, setChat] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [text, setText] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const nextId = useRef(1)
  const { setVideoEl, error: camError } = useLocalCamera({ video: cam, audio: mic })

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Mensaje inicial del médico simulado
  useEffect(() => {
    if (!c?.doctor) return
    const t = setTimeout(() => setMsgs((m) => (m.length ? m : [{ id: nextId.current++, from: 'doctor', text: `Hola, soy ${c.doctor!.name}. Cuéntame con más detalle cómo te sientes.` }])), 1200)
    return () => clearTimeout(t)
  }, [c?.doctor])

  if (!c) return <div className="grid min-h-[60dvh] place-items-center text-sm text-muted" role="status">Conectando…</div>
  if (c.status === 'completed') return <Navigate to={`/consulta/${id}/resumen`} replace />
  if (c.status !== 'in_progress' || !c.doctor) return <Navigate to={`/buscando/${id}`} replace />

  const send = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const mine: Msg = { id: nextId.current++, from: 'me', text: text.trim() }
    setMsgs((m) => [...m, mine])
    setText('')
    setTimeout(() => setMsgs((m) => [...m, { id: nextId.current++, from: 'doctor', text: 'Entendido, gracias. Continuemos con la videollamada.' }]), 1400)
  }

  const end = () => finish.mutate(id, { onSuccess: () => nav(`/consulta/${id}/resumen`, { replace: true }) })

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0e1514] text-white">
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 grid place-items-center" style={{ background: `radial-gradient(circle at 50% 40%, hsl(${c.doctor.avatarHue} 40% 28%), #0e1514 70%)` }}>
          <div className="flex flex-col items-center gap-4">
            <Avatar name={c.doctor.name} hue={c.doctor.avatarHue} className="size-28 text-4xl" />
            <div className="text-center"><p className="font-display text-2xl font-bold">{c.doctor.name}</p><p className="text-sm text-white/60">{c.doctor.specialty}</p></div>
          </div>
        </div>
        <div className="pt-safe absolute left-0 right-0 top-0 flex items-center justify-between px-4 pb-4">
          <span className="rounded-full bg-black/40 px-3 py-1 text-sm backdrop-blur" role="timer" aria-label="Duración de la consulta">● {clock(seconds)}</span>
          <span className="rounded-full bg-black/40 px-3 py-1 text-xs backdrop-blur">Conexión segura</span>
        </div>
        <div className="absolute bottom-4 right-4 h-40 w-28 overflow-hidden rounded-2xl border border-white/20 bg-black/60 shadow-float sm:h-48 sm:w-36">
          {cam && !camError ? <video ref={setVideoEl} autoPlay playsInline muted className="size-full -scale-x-100 object-cover" /> : <div className="grid size-full place-items-center px-2 text-center text-xs text-white/60">{camError ? 'Cámara no disponible' : 'Cámara apagada'}</div>}
        </div>
      </div>

      <div className="pb-safe flex items-center justify-center gap-4 bg-[#0e1514] px-5 pt-5">
        <button type="button" aria-pressed={!mic} aria-label={mic ? 'Silenciar micrófono' : 'Activar micrófono'} onClick={() => setMic(!mic)} className={cn(ctrl, mic ? 'bg-white/10' : 'bg-white text-black')}>{mic ? <Mic className="size-5" /> : <MicOff className="size-5" />}</button>
        <button type="button" aria-pressed={!cam} aria-label={cam ? 'Apagar cámara' : 'Encender cámara'} onClick={() => setCam(!cam)} className={cn(ctrl, cam ? 'bg-white/10' : 'bg-white text-black')}>{cam ? <Video className="size-5" /> : <VideoOff className="size-5" />}</button>
        <button type="button" aria-label="Abrir chat" onClick={() => setChat(true)} className={cn(ctrl, 'bg-white/10')}><MessageSquare className="size-5" /></button>
        <button type="button" aria-label="Terminar consulta" onClick={end} disabled={finish.isPending} className={cn(ctrl, 'bg-danger text-danger-foreground disabled:opacity-60')}><PhoneOff className="size-5" /></button>
      </div>

      <Sheet open={chat} onOpenChange={setChat} title="Chat con tu médico">
        <ul className="mb-4 flex max-h-64 min-h-32 flex-col gap-2 overflow-y-auto" aria-live="polite">
          {msgs.length === 0 && <li className="py-6 text-center text-sm text-muted">Aún no hay mensajes.</li>}
          {msgs.map((m) => <li key={m.id} className={cn('max-w-[80%] rounded-2xl px-4 py-2 text-sm', m.from === 'me' ? 'self-end bg-primary text-primary-foreground' : 'self-start bg-surface-2')}>{m.text}</li>)}
        </ul>
        <form onSubmit={send} className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} aria-label="Mensaje" placeholder="Escribe un mensaje…" className="h-12 min-w-0 flex-1 rounded-full border border-border bg-background px-4 outline-none focus:ring-4 focus:ring-primary/30" />
          <button type="submit" aria-label="Enviar" className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground"><Send className="size-4" /></button>
        </form>
      </Sheet>
    </div>
  )
}
