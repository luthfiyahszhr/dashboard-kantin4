import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createStall, getStallById, updateStall } from '../api/stalls'
import { getErrorMessage, getFieldErrors, getHttpStatus } from '../api/client'
import { ErrorState } from '../components/ErrorState'
import { FormField } from '../components/FormField'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import type { StallInput } from '../types/api'
import { EmptyState } from '../components/EmptyState'
import { parseId } from '../utils/parseId'

const emptyStall: StallInput = { name: '', category: '', location: '', description: '' }

export function StallFormPage() {
  const { id } = useParams()
  const stallId = parseId(id)
  const isEditing = id !== undefined
  const { user } = useAuth()
  const navigate = useNavigate()
  const { notify } = useToast()
  const [values, setValues] = useState<StallInput>(emptyStall)
  const [initialValues, setInitialValues] = useState<StallInput | null>(null)
  const [ownerId, setOwnerId] = useState<number | null>(null)
  const [retry, setRetry] = useState(0)
  const [loadedKey, setLoadedKey] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadIssue, setLoadIssue] = useState<{ key: string; error: unknown } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const loadKey = `${stallId ?? 'invalid'}:${retry}`
  const loading = isEditing && stallId !== null && loadedKey !== loadKey
  const loadError = loadIssue?.key === loadKey ? loadIssue.error : null

  useEffect(() => {
    if (!isEditing || stallId === null) return
    let active = true
    getStallById(stallId)
      .then((stall) => {
        if (!active) return
        const loadedValues = { name: stall.name, category: stall.category ?? '', location: stall.location ?? '', description: stall.description ?? '' }
        setValues(loadedValues)
        setInitialValues(loadedValues)
        setOwnerId(stall.ownerId)
      })
      .catch((error: unknown) => { if (active) setLoadIssue({ key: loadKey, error }) })
      .finally(() => { if (active) setLoadedKey(loadKey) })
    return () => { active = false }
  }, [isEditing, stallId, retry, loadKey])

  const changeField = (field: keyof StallInput) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setFieldErrors((current) => ({ ...current, [field]: '' }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (values.name.trim().length < 3) nextErrors.name = 'Nama warung minimal 3 karakter.'
    if (values.name.trim().length > 100) nextErrors.name = 'Nama warung maksimal 100 karakter.'
    if ((values.category?.trim().length ?? 0) > 50) nextErrors.category = 'Kategori maksimal 50 karakter.'
    if ((values.location?.length ?? 0) > 100) nextErrors.location = 'Lokasi maksimal 100 karakter.'
    if ((values.description?.length ?? 0) > 1000) nextErrors.description = 'Deskripsi maksimal 1000 karakter.'
    setFieldErrors(nextErrors)
    setFormError('')
    if (Object.keys(nextErrors).length > 0) return

    const payload: Partial<StallInput> = {}
    if (!isEditing) {
      payload.name = values.name.trim()
      if (values.category?.trim()) payload.category = values.category.trim()
      if (values.location?.trim()) payload.location = values.location.trim()
      if (values.description?.trim()) payload.description = values.description.trim()
    } else {
      const original = initialValues
      if (!original) return
      if (values.name.trim() !== original.name.trim()) payload.name = values.name.trim()
      const category = values.category?.trim() ?? ''
      if (category !== (original.category?.trim() ?? '')) payload.category = category
      const location = values.location?.trim() ?? ''
      if (location !== (original.location?.trim() ?? '')) payload.location = location
      const description = values.description?.trim() ?? ''
      if (description !== (original.description?.trim() ?? '')) payload.description = description
      if (Object.keys(payload).length === 0) {
        notify('Tidak ada perubahan.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (isEditing && stallId !== null) await updateStall(stallId, payload)
      else await createStall(payload as StallInput)
      notify(isEditing ? 'Perubahan warung tersimpan.' : 'Warung berhasil ditambahkan.')
      navigate('/', { replace: true })
    } catch (error) {
      setFieldErrors(getFieldErrors(error))
      setFormError(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (isEditing && stallId === null) return <main className="mx-auto max-w-3xl px-5 py-12"><EmptyState title="Warung tidak ditemukan" message="ID warung tidak valid." action={<Link className="text-sm font-bold text-emerald-900 underline" to="/">Kembali ke daftar warung</Link>} /></main>
  if (loading) return <main className="mx-auto grid min-h-[50vh] max-w-3xl place-items-center px-5"><Spinner label="Memuat data warung" /></main>
  if (loadError && getHttpStatus(loadError) === 404) return <main className="mx-auto max-w-3xl px-5 py-12"><ErrorState message="Warung tidak ditemukan." /></main>
  if (loadError) return <main className="mx-auto max-w-3xl px-5 py-12"><ErrorState message={getErrorMessage(loadError)} onRetry={() => setRetry((current) => current + 1)} /></main>
  if (isEditing && user?.role === 'owner' && ownerId !== null && ownerId !== user.id) {
    return <main className="mx-auto max-w-3xl px-5 py-14"><ErrorState message="Tidak punya akses: warung ini bukan milik Anda." /></main>
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <Link to="/" className="text-sm font-semibold text-emerald-900 hover:underline">← Kembali ke daftar</Link>
      <section className="mt-5 rounded-lg border border-emerald-950/10 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Kelola warung</p>
        <h1 className="mt-2 font-display text-3xl text-emerald-950">{isEditing ? 'Ubah data warung' : 'Tambah warung'}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Informasi tersimpan langsung ke layanan kantin.</p>
        {formError && <p className="mt-5 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{formError}</p>}
        <form className="mt-7 space-y-5" onSubmit={(event) => { void submit(event) }} noValidate>
          <FormField id="name" label="Nama warung" value={values.name} onChange={changeField('name')} error={fieldErrors.name} required minLength={3} maxLength={100} />
          <FormField id="category" label="Kategori" value={values.category} onChange={changeField('category')} error={fieldErrors.category} maxLength={50} placeholder="Contoh: Nasi, Minuman" />
          <FormField id="location" label="Lokasi" value={values.location} onChange={changeField('location')} error={fieldErrors.location} maxLength={100} placeholder="Contoh: Kantin A" />
          <FormField id="description" label="Deskripsi" value={values.description} onChange={changeField('description')} error={fieldErrors.description} multiline maxLength={1000} placeholder="Ceritakan menu atau ciri khas warung" />
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
            <Link to="/" className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</Link>
            <button type="submit" disabled={submitting} className="rounded-md bg-emerald-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Menyimpan...' : isEditing ? 'Simpan perubahan' : 'Simpan warung'}</button>
          </div>
        </form>
      </section>
    </main>
  )
}