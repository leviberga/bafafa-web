import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { describeError } from '../../lib/errors'
import { formatJoined } from '../../lib/format'
import type { Profile } from '../../lib/types'
import { EditProfileForm } from './EditProfileForm'
import { useFollowStats, useToggleFollow } from './queries'

interface ProfileHeaderProps {
  profile: Profile
  isSelf: boolean
}

export function ProfileHeader({ profile, isSelf }: ProfileHeaderProps) {
  const [editing, setEditing] = useState(false)
  const stats = useFollowStats(profile.handle)
  const toggleFollow = useToggleFollow(profile.handle)
  const following = stats.data?.followedByMe ?? false

  return (
    <section aria-label="Perfil" className="border-b border-tinta/15">
      <div className="h-24 bg-ipe" aria-hidden="true" />

      <div className="px-4 pb-5">
        <div className="-mt-10 flex items-end justify-between">
          <span className="inline-block rounded-lg ring-4 ring-papel">
            <Avatar name={profile.displayName} seed={profile.handle} size="lg" />
          </span>

          {isSelf ? (
            !editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-md border-2 border-tinta px-4 py-2 font-bold hover:bg-tinta/5"
              >
                Editar perfil
              </button>
            ) : null
          ) : (
            <button
              type="button"
              aria-pressed={following}
              aria-label={following ? `Deixar de seguir @${profile.handle}` : `Seguir @${profile.handle}`}
              disabled={!stats.data || toggleFollow.isPending}
              onClick={() => toggleFollow.mutate(following)}
              className={`group min-w-36 rounded-md px-5 py-2 font-bold disabled:opacity-50 ${
                following
                  ? 'border-2 border-tinta hover:border-pitanga hover:text-pitanga'
                  : 'bg-cobalto text-white hover:bg-cobalto/90'
              }`}
            >
              {following ? (
                <>
                  <span className="group-hover:hidden group-focus-visible:hidden">Seguindo</span>
                  <span className="hidden group-hover:inline group-focus-visible:inline">Deixar de seguir</span>
                </>
              ) : (
                'Seguir'
              )}
            </button>
          )}
        </div>

        <h1 className="mt-3 text-2xl font-extrabold leading-tight">{profile.displayName}</h1>
        <p className="text-tinta/65">@{profile.handle}</p>

        {toggleFollow.isError ? (
          <p role="alert" className="mt-2 font-semibold text-pitanga">
            {describeError(toggleFollow.error, 'Não foi possível atualizar. Tente de novo.')}
          </p>
        ) : null}

        {editing ? (
          <EditProfileForm profile={profile} onDone={() => setEditing(false)} />
        ) : (
          <>
            {profile.bio ? (
              <p className="mt-3 whitespace-pre-wrap break-words font-texto text-[1.0625rem] leading-relaxed">
                {profile.bio}
              </p>
            ) : isSelf ? (
              <p className="mt-3 text-tinta/65">Você ainda não escreveu uma bio.</p>
            ) : null}

            <p className="mt-3 text-sm text-tinta/65">Entrou em {formatJoined(profile.createdAt)}</p>

            <dl className="mt-3 flex gap-5">
              <div className="flex gap-1.5">
                <dd className="order-1 font-bold tabular-nums">{stats.data?.followingCount ?? '–'}</dd>
                <dt className="order-2 text-tinta/65">Seguindo</dt>
              </div>
              <div className="flex gap-1.5">
                <dd className="order-1 font-bold tabular-nums">{stats.data?.followerCount ?? '–'}</dd>
                <dt className="order-2 text-tinta/65">Seguidores</dt>
              </div>
            </dl>
          </>
        )}
      </div>
    </section>
  )
}
