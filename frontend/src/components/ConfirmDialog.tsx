import { useEffect, useRef } from 'react'

export function ConfirmDialog({ open, title, message, confirmLabel = 'Ya, hapus', onCancel, onConfirm, busy = false }: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm: () => void
  busy?: boolean
}) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const onCancelRef = useRef(onCancel)
  const busyRef = useRef(busy)

  useEffect(() => { onCancelRef.current = onCancel }, [onCancel])
  useEffect(() => { busyRef.current = busy }, [busy])

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busyRef.current) onCancelRef.current()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    cancelButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}>
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <h2 className="font-display text-2xl text-emerald-950" id="confirm-title">{title}</h2>
        <p className="my-3 text-sm leading-6 text-slate-600" id="confirm-message">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button ref={cancelButtonRef} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onCancel} disabled={busy}>Batal</button>
          <button className="rounded-md bg-rose-800 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50" onClick={onConfirm} disabled={busy}>{busy ? 'Memproses...' : confirmLabel}</button>
        </div>
      </section>
    </div>
  )
}