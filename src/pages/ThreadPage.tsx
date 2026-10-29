import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Composer } from '../features/feed/Composer'
import { FeedList } from '../features/feed/FeedList'
import { FocalPost } from '../features/feed/PostCard'
import { useCreateReply, useReplies, useThread } from '../features/thread/queries'
import { ApiError } from '../lib/api'
import { describeError } from '../lib/errors'

export function ThreadPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const thread = useThread(id)
  const replies = useReplies(id)
  const createReply = useCreateReply(id)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    if (thread.data) {
      document.title = `Post de ${thread.data.post.author.displayName} | Bafafá`
    }
    return () => {
      document.title = 'Bafafá'
    }
  }, [thread.data])

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const header = (
    <div className="flex items-center gap-3 border-b border-tinta/15 px-4 py-3">
      <button
        type="button"
        onClick={goBack}
        aria-label="Voltar"
        className="rounded-md px-2 py-1 text-xl font-bold hover:bg-tinta/5"
      >
        <span aria-hidden="true">←</span>
      </button>
      <h1 className="text-xl font-extrabold">Post</h1>
    </div>
  )

  if (thread.isPending) {
    return (
      <>
        {header}
        <p role="status" className="px-4 py-10 text-center font-semibold text-tinta/65">
          Carregando o post…
        </p>
      </>
    )
  }

  if (thread.isError) {
    const notFound = thread.error instanceof ApiError && thread.error.status === 404
    return (
      <>
        {header}
        <div role="alert" className="px-4 py-12 text-center">
          <h2 className="mb-2 text-2xl font-extrabold">{notFound ? 'Post não encontrado' : 'Algo deu errado'}</h2>
          <p className="mb-6 text-tinta/80">
            {notFound
              ? 'Ele pode ter sido apagado, ou o endereço está errado.'
              : describeError(thread.error, 'Não foi possível carregar o post.')}
          </p>
          <Link to="/" className="font-bold text-cobalto underline underline-offset-4">
            Voltar ao início
          </Link>
        </div>
      </>
    )
  }

  const { post, inReplyTo } = thread.data

  return (
    <>
      {header}
      <FocalPost post={post} inReplyTo={inReplyTo} />
      <Composer
        label={`Responder a @${post.author.handle}`}
        placeholder={`Responder a @${post.author.handle}`}
        buttonLabel="Responder"
        pendingLabel="Respondendo…"
        errorFallback="Não foi possível responder. Confira o texto e tente de novo."
        mutation={createReply}
      />
      <FeedList feed={replies} emptyMessage="Ainda ninguém respondeu. Que tal ser a primeira pessoa?" />
    </>
  )
}
