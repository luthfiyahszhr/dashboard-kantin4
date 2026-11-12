
function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true">
      <span className="size-2 rounded-full bg-[#102BBF] animate-bounce [animation-delay:0ms]" />
      <span className="size-2 rounded-full bg-[#FFBF1B] animate-bounce [animation-delay:150ms]" />
      <span className="size-2 rounded-full bg-[#102BBF] animate-bounce [animation-delay:300ms]" />
    </span>
  )
}

export function Spinner({
  label = 'Memuat',
  small = false,
}: {
  label?: string
  small?: boolean
}) {
  return (
    <span
      className={`inline-flex items-center gap-3 text-sm font-semibold text-[#102BBF] ${small ? 'text-xs' : ''}`}
      role="status"
    >
      <LoadingDots />
      <span>{label}</span>
    </span>
  )
}

export function StallSkeletons() {
  return (
    <div aria-label="Memuat daftar warung" aria-busy="true">
      <div className="mb-6 flex items-center justify-center gap-3 rounded-2xl bg-[#FFF7EB] py-5">
        <LoadingDots />
        <span className="text-sm font-semibold text-[#102BBF]">
          Sedang memuat data warung...
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-[#102BBF]/10 bg-white p-5"
          >
            <div className="mb-6 h-4 w-20 rounded bg-[#FFBF1B]/30" />
            <div className="mb-3 h-6 w-3/4 rounded bg-slate-100" />
            <div className="mb-2 h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-2/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}