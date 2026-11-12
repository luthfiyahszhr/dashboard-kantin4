import { useEffect, useEffectEvent, useState } from 'react'

interface DebouncedInputProps {
  id: string
  label: string
  placeholder: string
  value: string
  onCommit: (value: string) => void
  delay?: number
}

export function DebouncedInput({ id, label, placeholder, value, onCommit, delay = 350 }: DebouncedInputProps) {
  const [text, setText] = useState(value)
  // Nilai terakhir yang kita kirim ke induk (atau terima dari luar).
  const [committed, setCommitted] = useState(value)
  const [seenValue, setSeenValue] = useState(value)
  const commit = useEffectEvent((next: string) => onCommit(next))

  // Nilai dari URL berubah. Jika bukan hasil commit kita sendiri
  // (mis. tombol "Hapus filter" atau tombol Back browser), samakan isi input.
  if (value !== seenValue) {
    setSeenValue(value)
    if (value !== committed) {
      setText(value)
      setCommitted(value)
    }
  }

  useEffect(() => {
    const normalized = text.trim()
    if (normalized === committed) return
    const timer = window.setTimeout(() => {
      setCommitted(normalized)
      commit(normalized)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [text, committed, delay])

  return (
    <label className="block text-xs font-bold text-slate-700" htmlFor={id}>
      {label}
      <input
        id={id}
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal"
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </label>
  )
}