import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { deleteStall, getStalls } from '../api/stalls'
import { getErrorMessage } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { Pagination } from '../components/Pagination'
import { StallCard } from '../components/StallCard'
import { StallSkeletons } from '../components/Spinner'
import { DebouncedInput } from '../components/DebouncedInput'
import { Mascot } from '../components/Mascot'
import { StampStrip } from '../components/StampStrip'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import type { Stall, StallListResponse } from '../types/api'

const PAGE_SIZE = 9
const QUICK_CATEGORIES = ['Nasi', 'Bakso', 'Mie', 'Kwetiau', 'Minuman']

export function StallListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { notify } = useToast()
  const searchTerm = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const page = Math.max(1, Math.floor(Number(searchParams.get('page') ?? 1) || 1))
  const [response, setResponse] = useState<StallListResponse | null>(null)
  const [reload, setReload] = useState(0)
  const [selectedStall, setSelectedStall] = useState<Stall | null>(null)
  const [deleting, setDeleting] = useState(false)

  const requestKey = `${searchTerm}|${category}|${page}|${reload}`
  const [loadedKey, setLoadedKey] = useState('')
  const [requestIssue, setRequestIssue] = useState<{ key: string; message: string } | null>(null)
  const loading = loadedKey !== requestKey
  const error = requestIssue?.key === requestKey ? requestIssue.message : ''

  useEffect(() => {
    let active = true
    getStalls({
      search: searchTerm || undefined,
      category: category || undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((result) => { if (active) setResponse(result) })
      .catch((requestError: unknown) => { if (active) setRequestIssue({ key: requestKey, message: getErrorMessage(requestError) }) })
      .finally(() => { if (active) setLoadedKey(requestKey) })
    return () => { active = false }
  }, [searchTerm, category, page, reload, requestKey])

  const updateQuery = (key: string, value: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    }, { replace: true })
  }

  const changePage = (nextPage: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('page', String(nextPage))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmDelete = async () => {
    if (!selectedStall) return
    setDeleting(true)
    try {
      await deleteStall(selectedStall.id)
      setSelectedStall(null)
      notify('Warung berhasil dihapus.')
      setReload((current) => current + 1)
    } catch (requestError) {
      notify(getErrorMessage(requestError), 'error')
    } finally {
      setDeleting(false)
    }
  }

  const stalls = response?.data ?? []
  const pageCount = Math.max(1, Math.ceil((response?.meta.total ?? 0) / PAGE_SIZE))
  const hasFilters = Boolean(searchTerm || category)
  const pageOutOfRange = Boolean(response && !loading && !error && page > pageCount)

  useEffect(() => {
    if (!pageOutOfRange) return
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (pageCount <= 1) next.delete('page')
      else next.set('page', String(pageCount))
      return next
    }, { replace: true })
  }, [pageOutOfRange, pageCount, setSearchParams])

  return (
    <>
      <section className="px-5 pt-2 sm:px-8">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-6 overflow-hidden rounded-[2rem] bg-[#2340c8] px-6 py-8 text-white sm:px-10 sm:py-12">
          <div className="max-w-2xl">
            <p className="mb-4 inline-block rounded-full bg-[#ffc93c] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#14143a]">Peta rasa kampus</p>
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">Setiap sudut punya rasa, setiap warung punya cerita.</h1>
            <p className="mt-4 text-base font-semibold text-[#dde4ff]">Temukan. Rasakan. Ceritakan.</p>
          </div>
          <Mascot className="hidden size-40 shrink-0 sm:block lg:size-48" />
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-6 flex flex-col gap-4 border-b border-emerald-950/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-800">Jelajahi kantin</p>
            <h2 className="mt-1 font-display text-3xl text-emerald-950">Daftar warung</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
            <DebouncedInput id="stall-search" label="Cari nama warung" placeholder="ex. Warung Nasi" value={searchTerm} onCommit={(value) => updateQuery('search', value)} />
            <DebouncedInput id="stall-category" label="Filter kategori" placeholder="ex. Minuman" value={category} onCommit={(value) => updateQuery('category', value)} />
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Kategori cepat">
          {['', ...QUICK_CATEGORIES].map((item) => {
            const active = category.toLowerCase() === item.toLowerCase()
            return (
              <button key={item || 'all'} type="button" aria-pressed={active} onClick={() => updateQuery('category', item)} className={`rounded-full border-2 border-[#14143a] px-4 py-1.5 text-sm font-semibold transition ${active ? 'bg-[#ffc93c] text-[#14143a]' : 'bg-transparent text-[#14143a] hover:bg-white'}`}>{item || 'Semua'}</button>
            )
          })}
        </div>

        {response && !loading && <p className="mb-4 text-sm text-slate-600">{response.meta.total} warung ditemukan</p>}
        {loading || pageOutOfRange ? <StallSkeletons /> : error ? <ErrorState message={error} onRetry={() => setReload((current) => current + 1)} /> : stalls.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'Belum ada yang cocok' : 'Belum ada warung'}
            message={hasFilters ? 'Coba ubah kata pencarian atau kategori untuk melihat pilihan lain.' : 'Daftar warung akan muncul setelah data tersedia di backend.'}
            action={hasFilters ? <button className="rounded-md border border-emerald-800 px-4 py-2 text-sm font-semibold text-emerald-900" onClick={() => setSearchParams({}, { replace: true })}>Hapus filter</button> : undefined}
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {stalls.map((stall) => (
                <StallCard
                  key={stall.id}
                  stall={stall}
                  canEdit={user?.role === 'admin' || (user?.role === 'owner' && user.id === stall.ownerId)}
                  canDelete={user?.role === 'admin'}
                  onDelete={setSelectedStall}
                />
              ))}
            </div>
            <div className="mt-8"><StampStrip /></div>
            <div className="mt-8">
              <Pagination page={page} pageCount={pageCount} onChange={changePage} />
            </div>
          </>
        )}
      </main>

      <ConfirmDialog
        open={Boolean(selectedStall)}
        title="Hapus warung?"
        message={`Data ${selectedStall?.name ?? 'warung ini'} akan dihapus dari backend.`}
        onCancel={() => setSelectedStall(null)}
        onConfirm={() => { void confirmDelete() }}
        busy={deleting}
      />
    </>
  )
}