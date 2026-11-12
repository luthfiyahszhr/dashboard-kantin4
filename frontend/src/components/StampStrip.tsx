// Strip stempel ulasan. Saat ini hanya tampilan: isi `filled` dari jumlah ulasan user jika backend sudah menyediakannya.
export function StampStrip({ total = 7, filled = 0 }: { total?: number; filled?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-[2.5px] border-[#14143a] bg-white px-4 py-3">
      <p className="text-sm font-semibold text-[#14143a]">Tulis {total} ulasan, dapat lencana!</p>
      <div className="flex gap-1.5" role="img" aria-label={`${filled} dari ${total} stempel terisi`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`size-5 rounded-full border-[2.5px] border-[#14143a] ${i < filled ? 'bg-[#ffc93c]' : 'bg-white'}`} />
        ))}
      </div>
    </div>
  )
}
