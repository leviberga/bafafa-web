import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { postsApi, timelineApi } from '../../lib/endpoints'
import { threadKey } from '../feed/queries'

/** As respostas ficam sob a raiz 'feed', então curtir uma resposta também atualiza o cache dela. */
export const repliesKey = (postId: string) => ['feed', 'replies', postId] as const

export function useThread(postId: string) {
  return useQuery({
    queryKey: threadKey(postId),
    queryFn: () => timelineApi.post(postId),
    enabled: postId.length > 0,
  })
}

export function useReplies(postId: string) {
  return useInfiniteQuery({
    queryKey: repliesKey(postId),
    queryFn: ({ pageParam }) => timelineApi.replies(postId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: postId.length > 0,
  })
}

export function useCreateReply(postId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (text: string) => postsApi.reply(postId, text),
    // Responder é consistente na hora, então podemos recarregar a lista de respostas.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: repliesKey(postId) }),
  })
}
