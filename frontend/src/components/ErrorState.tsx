export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <section className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-6" role="alert">
      <h2 className="mb-1 text-lg font-semibold text-rose-950">Ada kendala</h2>
      <p className="mb-4 text-sm leading-6 text-rose-800">{message}</p>
      {onRetry && (
        <button className="rounded-md bg-rose-900 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800" onClick={onRetry}>
          Coba lagi
        </button>
      )}
    </section>
  )
}