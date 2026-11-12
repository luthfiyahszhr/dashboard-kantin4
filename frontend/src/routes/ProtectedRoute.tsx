import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { Role } from '../types/api'
import { Spinner } from '../components/Spinner'

export function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { user, loading, sessionExpired } = useAuth()
  const location = useLocation()

  if (loading) return <div className="grid min-h-[50vh] place-items-center"><Spinner label="Memeriksa sesi" /></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location, expired: sessionExpired }} />
  if (roles && !roles.includes(user.role)) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <p className="mb-2 text-sm font-bold uppercase text-rose-800">403</p>
        <h1 className="font-display text-4xl text-emerald-950">Tidak punya akses</h1>
        <p className="mt-3 text-slate-600">Akun dengan role {user.role} tidak dapat mengakses halaman ini.</p>
        <Link to="/" className="mx-auto mt-6 inline-block rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">Kembali ke beranda</Link>
      </main>
    )
  }
  return children
}