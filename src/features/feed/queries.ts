import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query'
import { postsApi, timelineApi } from '../../lib/endpoints'
import type { Engagement, PostThread, TimelinePage } from '../../lib/types'

/** Todo feed do app começa com 'feed', então dá para atualizar ou invalidar todos de uma vez. */
export const feedRootKey = ['feed'] as const
export const homeFeedKey = ['feed', 'home'] as const
export const userFeedKey = (handle: string) => ['feed', 'user', handle] as const
/** O post aberto na página do post (não é um feed, por isso fica fora da raiz 'feed'). */
export const threadRootKey = ['thread'] as const
export const threadKey = (id: string) => ['thread', id] as const

export type FeedData = InfiniteData<TimelinePage, string | undefined>

/** O que useInfiniteQuery devolve para os feeds (o tipo do pageParam é inferido como unknown). */
export type FeedResult = UseInfiniteQueryResult<InfiniteData<TimelinePage, unknown>, Error>

export function useHomeFeed() {
  return useInfiniteQuery({
    queryKey: homeFeedKey,
    queryFn: ({ pageParam }) => timelineApi.home(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}

export function useUserFeed(handle: string) {
  return useInfiniteQuery({
    queryKey: userFeedKey(handle),
    queryFn: ({ pageParam }) => timelineApi.ofUser(handle, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: handle.length > 0,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (text: string) => postsApi.create(text),
    // Criar um post é consistente na hora, então podemos recarregar os feeds (o home e o do próprio perfil).
    onSuccess: () => queryClient.invalidateQueries({ queryKey: feedRootKey }),
  })
}

/**
 * Atualiza as curtidas e os reposts direto no cache de TODOS os feeds e threads já carregados (o mesmo post
 * pode estar no home, no perfil e aberto na página do post), sem recarregar. No backend os contadores são eventualmente consistentes
 * (cerca de meio segundo), então recarregar logo depois de curtir traria o número antigo de volta.
 */
function patchEngagement(queryClient: QueryClient, postId: string, change: (current: Engagement) => Engagement) {
  queryClient.setQueriesData<PostThread>(
    { queryKey: threadRootKey },
    (thread) =>
      thread && thread.post.id === postId
        ? { ...thread, post: { ...thread.post, engagement: change(thread.post.engagement) } }
        : thread,
  )
  queryClient.setQueriesData<FeedData>(
    { queryKey: feedRootKey },
    (data) =>
      data && {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.post.id === postId
              ? { ...item, post: { ...item.post, engagement: change(item.post.engagement) } }
              : item,
          ),
        })),
      },
  )
}

const bump = (value: number, delta: number) => Math.max(0, value + delta)

interface ToggleVariables {
  postId: string
  /** O estado ANTES do clique. */
  active: boolean
}

export function useToggleLike() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, active }: ToggleVariables) => (active ? postsApi.unlike(postId) : postsApi.like(postId)),
    onMutate: ({ postId, active }) =>
      patchEngagement(queryClient, postId, (e) => ({
        ...e,
        likedByMe: !active,
        likeCount: bump(e.likeCount, active ? -1 : 1),
      })),
    onError: (_error, { postId, active }) =>
      patchEngagement(queryClient, postId, (e) => ({
        ...e,
        likedByMe: active,
        likeCount: bump(e.likeCount, active ? 1 : -1),
      })),
  })
}

export function useToggleRepost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, active }: ToggleVariables) =>
      active ? postsApi.unrepost(postId) : postsApi.repost(postId),
    onMutate: ({ postId, active }) =>
      patchEngagement(queryClient, postId, (e) => ({
        ...e,
        repostedByMe: !active,
        repostCount: bump(e.repostCount, active ? -1 : 1),
      })),
    onError: (_error, { postId, active }) =>
      patchEngagement(queryClient, postId, (e) => ({
        ...e,
        repostedByMe: active,
        repostCount: bump(e.repostCount, active ? 1 : -1),
      })),
  })
}
