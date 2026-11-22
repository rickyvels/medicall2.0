import { useEffect, useRef, useState } from 'react'

/** Vista previa local (getUserMedia). Si falla, la UI cae a un estado sin cámara. */
export function useLocalCamera(enabled: { video: boolean; audio: boolean }) {
  const streamRef = useRef<MediaStream | null>(null)
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const request = navigator.mediaDevices?.getUserMedia
      ? navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true })
      : Promise.reject(new Error('unsupported'))
    request
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        streamRef.current = s
        if (videoEl) videoEl.srcObject = s
      })
      .catch(() => setError(true))
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [videoEl])

  useEffect(() => {
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = enabled.video))
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = enabled.audio))
  }, [enabled.video, enabled.audio])

  return { setVideoEl, error }
}
