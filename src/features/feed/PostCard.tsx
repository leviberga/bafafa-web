import type { ReactNode } from 'react'
import { Avatar } from '../../components/Avatar'
import { HeartIcon, RepostIcon } from '../../components/icons'
import { formatFull, formatRelative } from '../../lib/format'
import type { TimelineItem } from '../../lib/types'
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

export function PostCard({ item }: { item: TimelineItem }) {
  const { post, repostedBy, kind } = item
  const { engagement } = post
  const like = useToggleLike()
  const repost = useToggleRepost()

  return (
    <article className="flex gap-3 border-b border-tinta/15 px-4 py-4">
      <Avatar name={post.author.displayName} seed={post.author.handle} />
      <div className="min-w-0 flex-1">
        {kind === 'REPOST' && repostedBy ? (
          <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-mate">
            <RepostIcon className="size-4" />
            {repostedBy.displayName} repostou
          </p>
        ) : null}

        <header className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-bold">{post.author.displayName}</span>
          <span className="text-sm text-tinta/65">@{post.author.handle}</span>
          <time dateTime={post.createdAt} title={formatFull(post.createdAt)} className="ml-auto text-sm text-tinta/65">
            {formatRelative(post.createdAt)}
          </time>
        </header>

        <p className="mt-1 whitespace-pre-wrap break-words font-texto text-[1.0625rem] leading-relaxed">{post.text}</p>

        <div className="-ml-2 mt-2 flex gap-4">
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
        </div>
      </div>
    </article>
  )
}
