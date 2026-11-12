import { Link } from 'react-router-dom'
import type { Stall } from '../types/api'

export function StallCard({ stall, canEdit, canDelete, onDelete }: {
  stall: Stall
  canEdit: boolean
  canDelete: boolean
  onDelete?: (stall: Stall) => void
}) {
  return (
    <article className="group flex min-h-56 flex-col rounded-3xl border-[2.5px] border-[#14143a] bg-white p-5 shadow-[4px_4px_0_#14143a] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#14143a]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#ffc93c] px-3 py-1 text-xs font-bold text-[#14143a]">{stall.category || 'Kategori lain'}</span>
        <span className="rounded-full bg-[#fff1f0] px-3 py-1 text-xs font-bold text-[#b3261e]">★ {stall.avgRating.toFixed(1)}</span>
      </div>
      <Link to={`/stalls/${stall.id}`} className="font-display text-2xl font-semibold leading-tight text-emerald-950 decoration-2 underline-offset-4 group-hover:underline">{stall.name}</Link>
      <p className="mt-2 text-sm text-slate-600">{stall.location || 'Lokasi belum dicantumkan'}</p>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{stall.description || 'Belum ada deskripsi.'}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="text-xs text-slate-500">{stall.reviewCount} ulasan</span>
        <div className="flex gap-2">
          {canEdit && <Link className="rounded-md border border-emerald-800 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-50" to={`/stalls/${stall.id}/edit`}>Ubah</Link>}
          {canDelete && <button className="rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-50" onClick={() => onDelete?.(stall)}>Hapus</button>}
        </div>
      </div>
    </article>
  )
}