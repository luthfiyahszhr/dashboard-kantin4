export function Mascot({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 150" className={className} aria-hidden="true" focusable="false">
      <circle cx="75" cy="85" r="52" fill="#fff" stroke="#14143a" strokeWidth="4" />
      <path d="M34 52 L38 18 L66 38 Z M116 52 L112 18 L84 38 Z" fill="#fff" stroke="#14143a" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="56" cy="82" r="6" fill="#14143a" />
      <circle cx="94" cy="82" r="6" fill="#14143a" />
      <path d="M62 100 Q75 114 88 100" fill="none" stroke="#14143a" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="44" cy="98" rx="8" ry="5" fill="#ffc93c" />
      <ellipse cx="106" cy="98" rx="8" ry="5" fill="#ffc93c" />
    </svg>
  )
}
