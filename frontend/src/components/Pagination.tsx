export function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (page: number) => void }) {
  if (pageCount <= 1) return null
  return (
    <nav className="flex items-center justify-between border-t border-slate-200 pt-5" aria-label="Navigasi halaman">
      <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-40" onClick={() => onChange(page - 1)} disabled={page <= 1}>Sebelumnya</button>
      <span className="text-sm text-slate-600">Halaman {page} dari {pageCount}</span>
      <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white disabled:opacity-40" onClick={() => onChange(page + 1)} disabled={page >= pageCount}>Berikutnya</button>
    </nav>
  )
}