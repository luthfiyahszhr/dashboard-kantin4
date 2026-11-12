import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getErrorMessage, getFieldErrors } from '../api/client'
import type { RegisterInput } from '../api/auth'
import { FormField } from '../components/FormField'
import { useAuth } from '../hooks/useAuth'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState<RegisterInput & { confirmPassword: string }>({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (values.name.trim().length < 3) nextErrors.name = 'Nama minimal 3 karakter.'
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) nextErrors.email = 'Masukkan email yang valid.'
    if (values.password.length < 8) nextErrors.password = 'Password minimal 8 karakter.'
    if (values.password !== values.confirmPassword) nextErrors.confirmPassword = 'Konfirmasi password belum sama.'
    setErrors(nextErrors)
    setMessage('')
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      await register({ name: values.name.trim(), email: values.email.trim(), password: values.password })
      navigate('/login?registered=1', { replace: true })
    } catch (error) {
      setErrors(getFieldErrors(error))
      setMessage(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-6xl items-center gap-8 px-5 py-10 md:grid-cols-[1fr_0.85fr] sm:px-8">
      <section className="max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Bergabung di kantin</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-emerald-950 sm:text-5xl">Satu akun untuk cerita rasa kampus.</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">Akun baru terdaftar sebagai customer. Role pengelola ditetapkan oleh backend.</p>
      </section>
      <section className="rounded-lg border border-emerald-950/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl text-emerald-950">Buat akun</h2>
        {message && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{message}</p>}
        <form className="mt-6 space-y-4" onSubmit={(event) => { void submit(event) }} noValidate>
          <FormField id="name" label="Nama" autoComplete="name" value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} error={errors.name} required minLength={3} maxLength={100} />
          <FormField id="email" label="Email" type="email" autoComplete="email" value={values.email} onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))} error={errors.email} required />
          <FormField id="password" label="Password" type="password" autoComplete="new-password" value={values.password} onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))} error={errors.password} required minLength={8} maxLength={72} />
          <FormField id="confirmPassword" label="Ulangi password" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={(event) => setValues((current) => ({ ...current, confirmPassword: event.target.value }))} error={errors.confirmPassword} required />
          <button type="submit" disabled={submitting} className="w-full rounded-md bg-emerald-900 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Membuat akun...' : 'Daftar'}</button>
        </form>
        <p className="mt-5 text-sm text-slate-600">Sudah punya akun? <Link className="font-bold text-emerald-900 underline underline-offset-2" to="/login">Login</Link></p>
      </section>
    </main>
  )
}