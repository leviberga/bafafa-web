import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../../components/Avatar'
import { HeartIcon, ReplyIcon, RepostIcon } from '../../components/icons'
import { formatFull, formatRelative } from '../../lib/format'
import type { PostCardData, ReplyContext, TimelineItem } from '../../lib/types'
import { useToggleLike, useToggleRepost } from './queries'

interface ActionButtonProps {
  label: string
  count: number
  active: boolean
  activeClass: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}

function ActionButton({ label, count, active, activeClass, disabled, onClick, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md px-2 py-1 font-semibold hover:bg-tinta/5 disabled:opacity-60 ${active ? activeClass : 'text-tinta/65'}`}
    >
      {children}
      <span className="tabular-nums">{count}</span>
    </button>
  )
}

/** Curtir, repostar e responder (que leva à página do post). */
function PostActions({ post }: { post: PostCardData }) {
  const { engagement } = post
  const like = useToggleLike()
  const repost = useToggleRepost()

  return (
    <div className="-ml-2 flex gap-4">
      <ActionButton
        label={engagement.likedByMe ? 'Descurtir' : 'Curtir'}
        count={engagement.likeCount}
        active={engagement.likedByMe}
        activeClass="text-pitanga"
        disabled={like.isPending}
        onClick={() => like.mutate({ postId: post.id, active: engagement.likedByMe })}
      >
        <HeartIcon filled={engagement.likedByMe} />
      </ActionButton>
      <ActionButton
        label={engagement.repostedByMe ? 'Desfazer repost' : 'Repostar'}
        count={engagement.repostCount}
        active={engagement.repostedByMe}
        activeClass="text-mate"
        disabled={repost.isPending}
        onClick={() => repost.mutate({ postId: post.id, active: engagement.repostedByMe })}
      >
        <RepostIcon />
      </ActionButton>
      <Link
        to={`/post/${post.id}`}
        aria-label="Responder"
        className="flex items-center rounded-md px-2 py-1 text-tinta/65 hover:bg-tinta/5"
      >
        <ReplyIcon />
      </Link>
    </div>
  )
}

/** O post como aparece nas listas (feeds e respostas). */
export function PostCard({ item }: { item: TimelineItem }) {
  const { post, repostedBy, kind } = item

  return (
    <article className="flex gap-3 border-b border-tinta/15 px-4 py-4">
      <Link to={`/perfil/${post.author.handle}`} tabIndex={-1} aria-hidden="true" className="shrink-0 self-start">
        <Avatar name={post.author.displayName} seed={post.author.handle} />
      </Link>
      <div className="min-w-0 flex-1">
        {kind === 'REPOST' && repostedBy ? (
          <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-mate">
            <RepostIcon className="size-4" />
            <span>
              <Link to={`/perfil/${repostedBy.handle}`} className="hover:underline">
                {repostedBy.displayName}
              </Link>{' '}
              repostou
            </span>
          </p>
        ) : null}

        <header className="flex flex-wrap items-baseline gap-x-2">
          <Link to={`/perfil/${post.author.handle}`} className="font-bold hover:underline">
            {post.author.displayName}
          </Link>
          <span className="text-sm text-tinta/65">@{post.author.handle}</span>
          <Link to={`/post/${post.id}`} className="ml-auto text-sm text-tinta/65 hover:underline">
            <time dateTime={post.createdAt} title={formatFull(post.createdAt)}>
              {formatRelative(post.createdAt)}
            </time>
          </Link>
        </header>

        <p className="mt-1 whitespace-pre-wrap break-words font-texto text-[1.0625rem] leading-relaxed">{post.text}</p>

        <div className="mt-2">
          <PostActions post={post} />
        </div>
      </div>
    </article>
  )
}

/** O post aberto na página do post: texto maior e data completa. */
export function FocalPost({ post, inReplyTo }: { post: PostCardData; inReplyTo: ReplyContext | null }) {
  return (
    <article className="border-b border-tinta/15 px-4 py-4">
      <header className="flex items-center gap-3">
        <Link to={`/perfil/${post.author.handle}`} tabIndex={-1} aria-hidden="true">
          <Avatar name={post.author.displayName} seed={post.author.handle} />
        </Link>
        <div className="min-w-0">
          <Link to={`/perfil/${post.author.handle}`} className="block truncate font-bold hover:underline">
            {post.author.displayName}
          </Link>
          <span className="text-tinta/65">@{post.author.handle}</span>
        </div>
      </header>

      {inReplyTo ? (
        <p className="mt-3 text-tinta/65">
          {inReplyTo.author ? (
            <>
              Em resposta a{' '}
              <Link to={`/post/${inReplyTo.postId}`} className="font-semibold text-cobalto hover:underline">
                @{inReplyTo.author.handle}
              </Link>
            </>
          ) : (
            'Em resposta a um post que não existe mais.'
          )}
        </p>
      ) : null}

      <p className="mt-4 whitespace-pre-wrap break-words font-texto text-[1.375rem] leading-relaxed">{post.text}</p>

      <time dateTime={post.createdAt} className="mt-4 block text-sm text-tinta/65">
        {formatFull(post.createdAt)}
      </time>

      <div className="mt-3 border-t border-tinta/15 pt-2">
        <PostActions post={post} />
      </div>
    </article>
  )
}
