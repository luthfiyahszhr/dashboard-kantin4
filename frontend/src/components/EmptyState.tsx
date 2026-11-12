import type { ReactNode } from 'react'

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <section className="rounded-lg border border-dashed border-emerald-900/20 bg-white/80 px-6 py-12 text-center">
      <p className="mb-2 font-display text-2xl text-emerald-950">{title}</p>
      <p className="mx-auto mb-5 max-w-md text-sm leading-6 text-slate-600">{message}</p>
      {action}
    </section>
  )
}