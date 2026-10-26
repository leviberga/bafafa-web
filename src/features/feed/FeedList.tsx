import { useEffect, useRef } from 'react'
import { describeError } from '../../lib/errors'
import { PostCard } from './PostCard'
import type { FeedResult } from './queries'

interface FeedListProps {
  feed: FeedResult
  emptyMessage: string
}

/** A lista de posts de um feed, com estados de carga, erro, vazio e carregamento automático da próxima página. */
export function FeedList({ feed, emptyMessage }: FeedListProps) {
  const sentinel = useRef<HTMLDivElement>(null)
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = feed

  useEffect(() => {
    const node = sentinel.current
    if (!node || !hasNextPage) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const items = feed.data?.pages.flatMap((page) => page.items) ?? []

  return (
    <>
      {feed.isPending ? (
        <p role="status" className="px-4 py-10 text-center font-semibold text-tinta/65">
          Carregando…
        </p>
      ) : null}

      {feed.isError ? (
        <div role="alert" className="px-4 py-10 text-center">
          <p className="mb-3 font-semibold text-pitanga">{describeError(feed.error, 'Não foi possível carregar os posts.')}</p>
          <button
            type="button"
            onClick={() => void feed.refetch()}
            className="rounded-md border-2 border-tinta px-4 py-2 font-bold hover:bg-tinta/5"
          >
            Tentar de novo
          </button>
        </div>
      ) : null}

      {feed.isSuccess && items.length === 0 && !hasNextPage ? (
        <p className="px-4 py-10 text-center text-tinta/80">{emptyMessage}</p>
      ) : null}

      {items.map((item) => (
        <PostCard key={`${item.kind}:${item.post.id}:${item.repostedBy?.id ?? ''}`} item={item} />
      ))}

      <div ref={sentinel} aria-hidden="true" />
      {isFetchingNextPage ? (
        <p role="status" className="px-4 py-6 text-center font-semibold text-tinta/65">
          Carregando mais…
        </p>
      ) : null}
    </>
  )
}
