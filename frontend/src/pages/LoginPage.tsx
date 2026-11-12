
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getErrorMessage, getFieldErrors } from '../api/client'
import type { LoginInput } from '../api/auth'
import { FormField } from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const locationState = location.state as {
    from?: { pathname?: string; search?: string; hash?: string }
    expired?: boolean
  } | null

  const { notify } = useToast()

  const [values, setValues] = useState<LoginInput>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: Record<string, string> = {}

    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      nextErrors.email = 'Masukkan email yang valid.'
    }

    if (!values.password) {
      nextErrors.password = 'Password wajib diisi.'
    }

    setErrors(nextErrors)
    setMessage('')

    if (Object.keys(nextErrors).length) return

    setSubmitting(true)

    try {
      await login({
        email: values.email.trim(),
        password: values.password,
      })

      setTransitioning(true)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      notify('Berhasil masuk.')
      navigate(locationState?.from ?? '/', { replace: true })
    } catch (error) {
      setErrors(getFieldErrors(error))
      setMessage(getErrorMessage(error))
      setTransitioning(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (transitioning) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF7EB] px-5">
        <section className="w-full max-w-md rounded-3xl border border-[#102BBF]/10 bg-white px-8 py-12 text-center shadow-xl">
          <h1 className="font-display text-3xl font-bold text-[#102BBF]">
            Ngantin Sayang
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Yeay, berhasil masuk!
          </p>

          <div className="my-8 flex justify-center gap-2">
            <span className="size-3 rounded-full bg-[#102BBF] animate-bounce [animation-delay:0ms]" />
            <span className="size-3 rounded-full bg-[#FFBF1B] animate-bounce [animation-delay:150ms]" />
            <span className="size-3 rounded-full bg-[#102BBF] animate-bounce [animation-delay:300ms]" />
          </div>

          <p className="font-semibold text-[#102BBF]">
            Menyiapkan halaman untukmu...
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Sebentar ya, kami sedang menyiapkan semuanya!
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-6xl items-center gap-8 px-5 py-10 md:grid-cols-[1fr_0.85fr] sm:px-8">
      <section className="max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
          Udah Laper?
        </p>

        <h1 className="mt-3 font-display text-4xl leading-tight text-emerald-950 sm:text-5xl">
          Ke aceh beli mangga
        </h1>
        <h1 className="mt-3 font-display text-4xl leading-tight text-emerald-950 sm:text-5xl">
          Ke sragen beli delima
        </h1>
        <h1 className="mt-3 font-display text-4xl leading-tight text-emerald-950 sm:text-5xl">
          Hati boleh saja terluka
        </h1>
        <h1 className="mt-3 font-display text-4xl leading-tight text-emerald-950 sm:text-5xl">
          Urusan makan jangan sampai lupa
        </h1>

        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
          #hihu
        </p>

        <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
          Gunakan akun Anda untuk mengelola warung atau melihat profil pengguna.
        </p>
      </section>

      <section className="rounded-lg border border-emerald-950/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-2xl text-emerald-950">Login</h2>

        {locationState?.expired && (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Sesi berakhir. Silakan login kembali.
          </p>
        )}

        {searchParams.get('registered') && (
          <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Registrasi berhasil. Silakan masuk.
          </p>
        )}

        {message && (
          <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
            {message}
          </p>
        )}

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => { void submit(event) }}
          noValidate
        >
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) =>
              setValues((current) => ({ ...current, email: event.target.value }))
            }
            error={errors.email}
            required
          />

          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) =>
              setValues((current) => ({ ...current, password: event.target.value }))
            }
            error={errors.password}
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-emerald-900 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
          >
            {submitting ? 'Memeriksa akun...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link
            className="font-bold text-emerald-900 underline underline-offset-2"
            to="/register"
          >
            Daftar
          </Link>
        </p>
      </section>
    </main>
  )
}