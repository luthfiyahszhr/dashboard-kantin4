import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="mx-auto grid min-h-[65vh] max-w-4xl place-content-center px-5 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">404</p>
      <h1 className="mt-2 font-display text-4xl text-emerald-950">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-sm text-slate-600">Alamat yang Anda buka tidak tersedia.</p>
      <Link to="/" className="mx-auto mt-6 rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">Kembali ke beranda</Link>
    </main>
  )
}