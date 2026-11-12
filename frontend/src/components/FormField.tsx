import type { ChangeEvent, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type FormFieldProps = {
  id: string
  label: string
  error?: string
  multiline?: boolean
  rows?: number
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'onChange'> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'onChange' | 'rows'>

export function FormField({ id, label, error, multiline, rows = 4, ...props }: FormFieldProps) {
  const classes = `mt-1 w-full rounded-md border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 ${error ? 'border-rose-400' : 'border-slate-300'} focus:border-emerald-700`
  return (
    <label className="block text-sm font-semibold text-slate-800" htmlFor={id}>
      {label}
      {multiline ? (
        <textarea {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)} id={id} rows={rows} className={classes} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
      ) : (
        <input {...(props as InputHTMLAttributes<HTMLInputElement>)} id={id} className={classes} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
      )}
      {error && <span className="mt-1 block text-xs font-medium text-rose-700" id={`${id}-error`}>{error}</span>}
    </label>
  )
}