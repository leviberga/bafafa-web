import { Composer } from '../features/feed/Composer'
import { FeedList } from '../features/feed/FeedList'
import { useCreatePost, useHomeFeed } from '../features/feed/queries'

export function HomePage() {
  const feed = useHomeFeed()
  const createPost = useCreatePost()

  return (
    <>
      <h1 className="sr-only">Início</h1>
      <Composer
        label="Escreva um post"
        placeholder="Solte o verbo"
        buttonLabel="Publicar"
        pendingLabel="Publicando…"
        errorFallback="Não foi possível publicar. Confira o texto e tente de novo."
        mutation={createPost}
      />
      <FeedList
        feed={feed}
        emptyMessage="Seu feed está vazio. Publique o primeiro post ou visite um perfil e siga alguém para ver o que anda rolando."
      />
    </>
  )
}
