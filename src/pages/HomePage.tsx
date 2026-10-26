import { Composer } from '../features/feed/Composer'
import { FeedList } from '../features/feed/FeedList'
import { useHomeFeed } from '../features/feed/queries'

export function HomePage() {
  const feed = useHomeFeed()

  return (
    <>
      <h1 className="sr-only">Início</h1>
      <Composer />
      <FeedList
        feed={feed}
        emptyMessage="Seu feed está vazio. Publique o primeiro post ou visite um perfil e siga alguém para ver o que anda rolando."
      />
    </>
  )
}
