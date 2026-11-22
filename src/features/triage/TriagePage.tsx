import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useEvaluateTriage, useSymptoms, useTriageQuestions } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ui/states'
import { cn } from '@/lib/utils'
import { useFlow } from '@/stores/triage'

export default function TriagePage() {
  const { symptomId = 'other' } = useParams()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const symptoms = useSymptoms()
  const questions = useTriageQuestions(symptomId)
  const evaluate = useEvaluateTriage()
  const setResult = useFlow((s) => s.setResult)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const symptom = symptoms.data?.find((s) => s.id === symptomId)
  if (symptoms.data && !symptom) return <Navigate to="/" replace />

  const qs = questions.data ?? []
  const q = qs[step]
  const selected = q ? answers[q.id] : undefined
  const isLast = step === qs.length - 1

  const next = () => {
    if (!isLast) return setStep((s) => s + 1)
    evaluate.mutate({ symptomId, answers }, {
      onSuccess: (result) => {
        setResult(symptomId, result, params.get('doctor'))
        nav('/triaje/resultado', { replace: true })
      },
    })
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" aria-label="Volver" onClick={() => (step > 0 ? setStep(step - 1) : nav(-1))} className="grid size-10 place-items-center rounded-full bg-surface-2 hover:bg-border"><ArrowLeft className="size-4" /></button>
        <div className="flex-1">
          <p className="mb-1.5 text-xs font-medium text-muted">{symptom?.label ?? 'Triaje'} · Pregunta {Math.min(step + 1, qs.length || 1)} de {qs.length || '…'}</p>
          <Progress value={q ? step + 1 : 0} max={qs.length || 1} label="Progreso del triaje" />
        </div>
      </div>

      {questions.isError ? <ErrorState onRetry={() => questions.refetch()} /> : !q ? (
        <div className="space-y-3"><Skeleton className="h-10 w-3/4" />{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
            <h1 className="mb-6 text-3xl font-bold">{q.text}</h1>
            <div role="radiogroup" aria-label={q.text} className="space-y-3">
              {q.options.map((o) => {
                const on = selected === o.id
                return (
                  <button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                    className={cn('flex w-full items-center justify-between rounded-2xl border p-4 text-left font-medium transition active:scale-[0.99]', on ? 'border-primary-strong bg-primary-soft' : 'border-border bg-surface hover:bg-surface-2')}>
                    {o.label}
                    <span className={cn('grid size-6 place-items-center rounded-full border', on ? 'border-primary-strong bg-primary-strong text-primary-foreground' : 'border-border')}>{on && <Check className="size-3.5" />}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {evaluate.isError && <p role="alert" className="mt-4 text-sm text-danger-foreground dark:text-danger">No pudimos evaluar tus respuestas. Inténtalo de nuevo.</p>}

      <div className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 px-4 pt-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <Link to="/" className="text-sm text-muted underline-offset-4 hover:underline">Cancelar</Link>
          <Button size="lg" className="ml-auto" disabled={!selected} loading={evaluate.isPending} onClick={next}>{isLast ? 'Ver recomendación' : 'Continuar'}</Button>
        </div>
      </div>
    </div>
  )
}
