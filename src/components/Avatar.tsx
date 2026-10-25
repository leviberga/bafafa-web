const PALETTE = [
  'bg-cobalto text-white',
  'bg-pitanga text-white',
  'bg-ipe text-tinta',
  'bg-mate text-white',
]

function colorFor(seed: string): string {
  let hash = 0
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]
}

interface AvatarProps {
  name: string
  seed: string
  size?: 'sm' | 'md'
}

/** Sem foto de perfil ainda: a inicial sobre um bloco de cor, que é sempre a mesma para o mesmo handle. */
export function Avatar({ name, seed, size = 'md' }: AvatarProps) {
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? '?'
  const dimensions = size === 'md' ? 'size-11 text-xl' : 'size-9 text-base'
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-md font-extrabold ${dimensions} ${colorFor(seed)}`}
    >
      {initial}
    </span>
  )
}
