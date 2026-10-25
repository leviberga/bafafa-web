import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query'
import { postsApi, timelineApi } from '../../lib/endpoints'
import type { Engagement, TimelinePage } from '../../lib/types'

export const homeFeedKey = ['feed', 'home'] as const

type FeedData = InfiniteData<TimelinePage, string | undefined>

export function useHomeFeed() {
  return useInfiniteQuery({
    queryKey: homeFeedKey,
    queryFn: ({ pageParam }) => timelineApi.home(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (text: string) => postsApi.create(text),
    // Criar um post é consistente na hora, então podemos recarregar o feed.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: homeFeedKey }),
  })
}

/**
 * Atualiza as curtidas e os reposts direto no cache, sem recarregar o feed.
 * No backend os contadores são eventualmente consistentes (cerca de meio segundo), então recarregar
 * logo depois de curtir traria o número antigo de volta. O valor certo chega na próxima carga.
 */
function patchEngagement(queryClient: QueryClient, postId: string, change: (current: Engagement) => Engagement) {
  queryClient.setQueryData<FeedData>(
    homeFeedKey,
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
