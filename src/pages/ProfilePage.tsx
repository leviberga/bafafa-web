import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/context'
import { FeedList } from '../features/feed/FeedList'
import { useUserFeed } from '../features/feed/queries'
import { ProfileHeader } from '../features/profile/ProfileHeader'
import { useProfile } from '../features/profile/queries'
import { ApiError } from '../lib/api'
import { describeError } from '../lib/errors'

export function ProfilePage() {
  const { handle = '' } = useParams()
  const { account } = useAuth()
  const profile = useProfile(handle)
  const feed = useUserFeed(handle)

  // Ao trocar de perfil, voltamos ao topo da página.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [handle])

  useEffect(() => {
    if (profile.data) {
      document.title = `${profile.data.displayName} (@${profile.data.handle}) | Bafafá`
    }
    return () => {
      document.title = 'Bafafá'
    }
  }, [profile.data])

  if (profile.isPending) {
    return (
      <p role="status" className="px-4 py-10 text-center font-semibold text-tinta/65">
        Carregando o perfil…
      </p>
    )
  }

  if (profile.isError) {
    const notFound = profile.error instanceof ApiError && profile.error.status === 404
    return (
      <div role="alert" className="px-4 py-12 text-center">
        <h1 className="mb-2 text-2xl font-extrabold">{notFound ? 'Perfil não encontrado' : 'Algo deu errado'}</h1>
        <p className="mb-6 text-tinta/80">
          {notFound
            ? `Não existe ninguém com o usuário @${handle}.`
            : describeError(profile.error, 'Não foi possível carregar o perfil.')}
        </p>
        <Link to="/" className="font-bold text-cobalto underline underline-offset-4">
          Voltar ao início
        </Link>
      </div>
    )
  }

  const isSelf = account?.handle.toLowerCase() === profile.data.handle.toLowerCase()

  return (
    <>
      <ProfileHeader profile={profile.data} isSelf={isSelf} />
      <FeedList
        feed={feed}
        emptyMessage={isSelf ? 'Você ainda não publicou nada. Que tal começar agora?' : 'Este perfil ainda não publicou nada.'}
      />
    </>
  )
}
