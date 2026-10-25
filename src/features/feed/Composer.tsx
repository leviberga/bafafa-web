import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useAuth } from '../../auth/context'
import { Avatar } from '../../components/Avatar'
import { describeError } from '../../lib/errors'
import { useCreatePost } from './queries'

const MAX_LENGTH = 280

export function Composer() {
  const { account } = useAuth()
  const [text, setText] = useState('')
  const createPost = useCreatePost()

  const remaining = MAX_LENGTH - text.length
  const canPublish = text.trim().length > 0 && remaining >= 0 && !createPost.isPending

  function publish() {
    if (!canPublish) return
    createPost.mutate(text.trim(), { onSuccess: () => setText('') })
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
          Escreva um post
        </label>
        <textarea
          id="composer"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder="Solte o verbo"
          className="w-full resize-none bg-transparent font-texto text-[1.0625rem] leading-relaxed placeholder:text-tinta/50 focus:outline-none"
        />
        {createPost.isError ? (
          <p role="alert" className="mb-2 font-semibold text-pitanga">
            {describeError(createPost.error, 'Não foi possível publicar. Confira o texto e tente de novo.')}
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
            {createPost.isPending ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </div>
    </form>
  )
}
