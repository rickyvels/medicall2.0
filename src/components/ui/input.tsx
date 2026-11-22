import { useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Field({ label, error, className, id, ...props }: Props) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">{label}</label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-err` : undefined}
        className={cn('h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base outline-none transition placeholder:text-muted/70 focus:border-primary-strong focus:ring-4 focus:ring-primary/30', error && 'border-danger', className)}
        {...props}
      />
      {error && <p id={`${inputId}-err`} role="alert" className="text-sm text-danger-foreground dark:text-danger">{error}</p>}
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

export function SelectField({ label, error, className, id, children, ...props }: SelectProps) {
  const auto = useId()
  const selectId = id ?? auto
  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-foreground">{label}</label>
      <select id={selectId} aria-invalid={!!error} aria-describedby={error ? `${selectId}-err` : undefined}
        className={cn('h-12 w-full rounded-2xl border border-border bg-surface px-3 text-base outline-none transition focus:border-primary-strong focus:ring-4 focus:ring-primary/30', error && 'border-danger', className)} {...props}>
        {children}
      </select>
      {error && <p id={`${selectId}-err`} role="alert" className="text-sm text-danger-foreground dark:text-danger">{error}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

export function TextareaField({ label, error, hint, className, id, ...props }: TextareaProps) {
  const auto = useId()
  const areaId = id ?? auto
  return (
    <div className="space-y-1.5">
      <label htmlFor={areaId} className="text-sm font-medium text-foreground">{label}</label>
      <textarea id={areaId} aria-invalid={!!error} aria-describedby={error ? `${areaId}-err` : hint ? `${areaId}-hint` : undefined}
        className={cn('min-h-28 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-base outline-none transition placeholder:text-muted/70 focus:border-primary-strong focus:ring-4 focus:ring-primary/30', error && 'border-danger', className)} {...props} />
      {hint && !error && <p id={`${areaId}-hint`} className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${areaId}-err`} role="alert" className="text-sm text-danger-foreground dark:text-danger">{error}</p>}
    </div>
  )
}
