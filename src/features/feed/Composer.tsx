import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useAuth } from '../../auth/context'
import { Avatar } from '../../components/Avatar'
import { describeError } from '../../lib/errors'

const MAX_LENGTH = 280

/** O mínimo que o compositor precisa de uma mutação; o resultado de useMutation satisfaz isto. */
interface ComposerMutation {
  mutate: (text: string, options: { onSuccess: () => void }) => void
  isPending: boolean
  isError: boolean
  error: unknown
}

interface ComposerProps {
  /** Texto para leitores de tela. */
  label: string
  placeholder: string
  buttonLabel: string
  pendingLabel: string
  errorFallback: string
  mutation: ComposerMutation
}

export function Composer({ label, placeholder, buttonLabel, pendingLabel, errorFallback, mutation }: ComposerProps) {
  const { account } = useAuth()
  const [text, setText] = useState('')

  const remaining = MAX_LENGTH - text.length
  const canPublish = text.trim().length > 0 && remaining >= 0 && !mutation.isPending

  function publish() {
    if (!canPublish) return
    mutation.mutate(text.trim(), { onSuccess: () => setText('') })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    publish()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      publish()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 border-b border-tinta/15 px-4 py-4">
      <Avatar name={account?.handle ?? '?'} seed={account?.handle ?? ''} />
      <div className="min-w-0 flex-1">
        <label htmlFor="composer" className="sr-only">
          {label}
        </label>
        <textarea
          id="composer"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent font-texto text-[1.0625rem] leading-relaxed placeholder:text-tinta/50 focus:outline-none"
        />
        {mutation.isError ? (
          <p role="alert" className="mb-2 font-semibold text-pitanga">
            {describeError(mutation.error, errorFallback)}
          </p>
        ) : null}
        <div className="flex items-center justify-end gap-4">
          <span
            className={`tabular-nums ${remaining < 0 ? 'font-bold text-pitanga' : remaining <= 20 ? 'font-bold' : 'text-tinta/65'}`}
            aria-live="polite"
          >
            {remaining}
          </span>
          <button
            type="submit"
            disabled={!canPublish}
            className="rounded-md bg-cobalto px-5 py-2 font-bold text-white hover:bg-cobalto/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {mutation.isPending ? pendingLabel : buttonLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
