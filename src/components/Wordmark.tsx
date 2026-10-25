export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-extrabold leading-none text-cobalto ${className}`}
      style={{ fontStretch: '75%' }}
    >
      Bafafá
    </span>
  )
}
