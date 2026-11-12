import { useCallback, useState, type ReactNode } from 'react'
import { ToastContext, type ToastMessage } from './toastContextValue'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])
  const notify = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now() + Math.random()
    setMessages((current) => [...current, { id, message, type }])
    window.setTimeout(() => setMessages((current) => current.filter((item) => item.id !== id)), 4000)
  }, [])
  const dismiss = useCallback((id: number) => setMessages((current) => current.filter((item) => item.id !== id)), [])

  return (
    <ToastContext.Provider value={{ messages, notify, dismiss }}>
      {children}
      <div className="fixed right-4 top-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {messages.map((item) => (
          <div key={item.id} className={`flex items-start justify-between gap-3 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg ${item.type === 'success' ? 'bg-emerald-900' : 'bg-rose-800'}`}>
            <span>{item.message}</span>
            <button aria-label="Tutup notifikasi" className="text-white/80 hover:text-white" onClick={() => dismiss(item.id)}>Tutup</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}