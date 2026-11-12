import { useEffect, useState } from 'react'
import { getMe } from '../api/auth'
import { getErrorMessage } from '../api/client'
import { ErrorState } from '../components/ErrorState'
import { Spinner } from '../components/Spinner'
import type { User } from '../types/api'

export function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [retry, setRetry] = useState(0)
  const [loadedAttempt, setLoadedAttempt] = useState<number | null>(null)
  const [requestIssue, setRequestIssue] = useState<{ attempt: number; message: string } | null>(null)
  const loading = loadedAttempt !== retry
  const error = requestIssue?.attempt === retry ? requestIssue.message : ''

  useEffect(() => {
    let active = true
    getMe()
      .then((result) => { if (active) setUser(result) })
      .catch((requestError: unknown) => { if (active) setRequestIssue({ attempt: retry, message: getErrorMessage(requestError) }) })
      .finally(() => { if (active) setLoadedAttempt(retry) })
    return () => { active = false }
  }, [retry])

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Akun aktif</p>
      <h1 className="mt-2 font-display text-4xl text-emerald-950">Profil</h1>
      <section className="mt-6 rounded-lg border border-emerald-950/10 bg-white p-6 shadow-sm sm:p-8">
        {loading ? <Spinner label="Mengambil profil" /> : error ? <ErrorState message={error} onRetry={() => setRetry((current) => current + 1)} /> : user && (
          <dl className="grid gap-5 sm:grid-cols-2">
            <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Nama</dt><dd className="mt-1 text-lg font-semibold text-slate-900">{user.name}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Email</dt><dd className="mt-1 break-all text-lg font-semibold text-slate-900">{user.email}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Role</dt><dd className="mt-1 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold capitalize text-emerald-900">{user.role}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">ID Pengguna</dt><dd className="mt-1 text-lg font-semibold text-slate-900">{user.id}</dd></div>
          </dl>
        )}
      </section>
    </main>
  )
}