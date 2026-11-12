import { Link, useNavigate } from 'react-router-dom'
import { Mascot } from './Mascot'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const roleNames = { admin: 'Admin', owner: 'Owner', customer: 'Customer' } as const

export function Navbar() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const { notify } = useToast()
  const canManage = user?.role === 'admin' || user?.role === 'owner'

  const signOut = () => {
    logout()
    notify('Anda telah logout.')
    navigate('/', { replace: true })
  }

  return (
    <header className="border-b border-emerald-950/10 bg-[#fff8ec]">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-8" aria-label="Navigasi utama">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Ngantin Sayang, beranda">
          <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-emerald-900"><Mascot className="size-9 translate-y-0.5" /></span>
          <span><span className="block font-display text-lg font-bold leading-tight text-emerald-950">Ngantin Sayang</span><span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Makan Dulu</span></span>
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {canManage && <Link to="/stalls/new" className="rounded-md px-3 py-2 text-sm font-bold text-emerald-900 hover:bg-emerald-50">Tambah Warung</Link>}
          {loading ? <span className="px-3 py-2 text-sm text-slate-500">Memeriksa sesi...</span> : user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-emerald-50">
                <span className="hidden max-w-36 truncate text-sm font-semibold text-slate-800 sm:inline">{user.name}</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-950">{roleNames[user.role]}</span>
              </Link>
              <button onClick={signOut} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50">Login</Link>
              <Link to="/register" className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}