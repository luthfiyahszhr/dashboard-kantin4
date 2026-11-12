import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getErrorMessage, getHttpStatus } from '../api/client'
import { deleteStall, getStallById, getStallMenus } from '../api/stalls'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import type { MenuItem, Stall } from '../types/api'
import { parseId } from '../utils/parseId'

export function StallDetailPage() {
  const { id } = useParams()
  const stallId = parseId(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { notify } = useToast()
  const [stall, setStall] = useState<Stall | null>(null)
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [retry, setRetry] = useState(0)
  const [menuRetry, setMenuRetry] = useState(0)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const requestKey = `${stallId ?? 'invalid'}:${retry}`
  const [loadedKey, setLoadedKey] = useState('')
  const [requestIssue, setRequestIssue] = useState<{ key: string; error: unknown } | null>(null)
  const [menuLoadedKey, setMenuLoadedKey] = useState('')
  const [menuIssue, setMenuIssue] = useState<{ key: string; error: unknown } | null>(null)
  const menuRequestKey = `${stallId ?? 'invalid'}:${menuRetry}`
  const loading = stallId !== null && loadedKey !== requestKey
  const menuLoading = stallId !== null && menuLoadedKey !== menuRequestKey
  const error = requestIssue?.key === requestKey ? requestIssue.error : null
  const menuError = menuIssue?.key === menuRequestKey ? menuIssue.error : null

  useEffect(() => {
    if (stallId === null) return
    let active = true
    getStallById(stallId)
      .then((stallData) => { if (active) setStall(stallData) })
      .catch((requestError: unknown) => { if (active) setRequestIssue({ key: requestKey, error: requestError }) })
      .finally(() => { if (active) setLoadedKey(requestKey) })
    return () => { active = false }
  }, [stallId, retry, requestKey])

  useEffect(() => {
    if (stallId === null) return
    let active = true
    getStallMenus(stallId)
      .then((menuData) => { if (active) setMenus(menuData) })
      .catch((requestError: unknown) => { if (active) setMenuIssue({ key: menuRequestKey, error: requestError }) })
      .finally(() => { if (active) setMenuLoadedKey(menuRequestKey) })
    return () => { active = false }
  }, [stallId, menuRetry, menuRequestKey])

  const confirmDelete = async () => {
    if (stallId === null) return
    setDeleting(true)
    try {
      await deleteStall(stallId)
      notify('Warung berhasil dihapus.')
      navigate('/')
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error')
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (stallId === null) return <main className="mx-auto max-w-5xl px-5 py-12"><EmptyState title="Warung tidak ditemukan" message="ID warung tidak valid." action={<Link className="text-sm font-bold text-emerald-900 underline" to="/">Kembali ke daftar warung</Link>} /></main>
  if (loading) return <main className="mx-auto grid min-h-[50vh] max-w-5xl place-items-center px-5"><Spinner label="Memuat detail warung" /></main>
  if (getHttpStatus(error) === 404) return <main className="mx-auto max-w-5xl px-5 py-12"><EmptyState title="Warung tidak ditemukan" message="Warung yang Anda cari tidak tersedia atau sudah dihapus." action={<Link className="text-sm font-bold text-emerald-900 underline" to="/">Kembali ke daftar warung</Link>} /></main>
  if (error) return <main className="mx-auto max-w-5xl px-5 py-12"><ErrorState message={getErrorMessage(error)} onRetry={() => setRetry((current) => current + 1)} /></main>
  if (!stall) return null

  const canEdit = user?.role === 'admin' || (user?.role === 'owner' && user.id === stall.ownerId)

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <Link to="/" className="text-sm font-semibold text-emerald-900 hover:underline">← Kembali ke daftar</Link>
      <article className="mt-6 overflow-hidden rounded-3xl border-2 border-[#090b2b] bg-white shadow-[5px_5px_0_#090b2b]">
        <div className="bg-[#102bbf] px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#ffbf1b] px-3 py-1 text-xs font-bold text-[#090b2b]">{stall.category || 'Kategori lain'}</span>
            {stall.isPopular && <span className="rounded-full bg-[#ffbf1b] px-3 py-1 text-xs font-bold text-[#090b2b]">Favorit kampus</span>}
          </div>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">{stall.name}</h1>
          <p className="mt-3 text-sm text-emerald-50/85">{stall.location || 'Lokasi belum dicantumkan'}</p>
        </div>
        <div className="grid gap-8 p-6 sm:grid-cols-[1fr_15rem] sm:p-10">
          <div>
            <h2 className="font-display text-2xl text-emerald-950">Tentang warung</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">{stall.description || 'Belum ada deskripsi untuk warung ini.'}</p>
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="font-display text-2xl text-emerald-950">Menu</h2>
              {menuLoading ? <div className="mt-3"><Spinner label="Memuat menu" small /></div> : menuError ? <div className="mt-3"><ErrorState message="Menu tidak dapat dimuat." onRetry={() => setMenuRetry((current) => current + 1)} /></div> : menus.length === 0 ? <p className="mt-3 text-sm text-slate-600">Belum ada menu yang ditampilkan.</p> : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {menus.map((menu) => <li key={menu.id} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="font-medium text-slate-800">{menu.name}{!menu.isAvailable && <span className="ml-2 text-xs text-slate-500">(tidak tersedia)</span>}</span><span className="font-semibold text-emerald-900">Rp{menu.price.toLocaleString('id-ID')}</span></li>)}
                </ul>
              )}
            </div>
          </div>
          <aside className="h-fit rounded-2xl border-2 border-[#090b2b] bg-[#fff7eb] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Penilaian</p>
            <p className="mt-2 text-4xl font-semibold text-emerald-950">{stall.avgRating.toFixed(1)}<span className="ml-1 text-amber-600">★</span></p>
            <p className="mt-1 text-sm text-slate-600">dari {stall.reviewCount} ulasan</p>
            {canEdit && <Link to={`/stalls/${stall.id}/edit`} className="mt-6 block rounded-xl border-2 border-[#090b2b] bg-[#ffbf1b] px-4 py-2 text-center text-sm font-bold text-[#090b2b] hover:bg-[#ffd45c]">Ubah warung</Link>}
            {user?.role === 'admin' && <button className="mt-3 w-full rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-50 disabled:opacity-50" onClick={() => setDeleteOpen(true)} disabled={deleting}>Hapus warung</button>}
          </aside>
        </div>
      </article>
      <ConfirmDialog open={deleteOpen} title="Hapus warung?" message={`Data ${stall.name} akan dihapus dari backend.`} onCancel={() => setDeleteOpen(false)} onConfirm={() => { void confirmDelete() }} busy={deleting} />
    </main>
  )
}