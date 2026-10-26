import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profilesApi } from '../../lib/endpoints'
import type { FollowStats, UpdateProfileInput } from '../../lib/types'
import { feedRootKey, homeFeedKey } from '../feed/queries'

const followStatsRootKey = ['follow-stats'] as const
export const profileKey = (handle: string) => ['profile', handle] as const
export const followStatsKey = (handle: string) => ['follow-stats', handle] as const

export function useProfile(handle: string) {
  return useQuery({
    queryKey: profileKey(handle),
    queryFn: () => profilesApi.get(handle),
    enabled: handle.length > 0,
  })
}

export function useFollowStats(handle: string) {
  return useQuery({
    queryKey: followStatsKey(handle),
    queryFn: () => profilesApi.followStats(handle),
    enabled: handle.length > 0,
  })
}

/** Seguir e deixar de seguir. O grafo é consistente na hora no backend, então podemos recarregar depois. */
export function useToggleFollow(handle: string) {
  const queryClient = useQueryClient()

  const adjust = (following: boolean) =>
    queryClient.setQueryData<FollowStats>(
      followStatsKey(handle),
      (stats) =>
        stats && {
          ...stats,
          followedByMe: following,
          followerCount: Math.max(0, stats.followerCount + (following ? 1 : -1)),
        },
    )

  return useMutation({
    /** `following` é o estado ANTES do clique. */
    mutationFn: (following: boolean) => (following ? profilesApi.unfollow(handle) : profilesApi.follow(handle)),
    onMutate: (following) => {
      adjust(!following)
    },
    onError: (_error, following) => {
      adjust(following)
    },
    onSettled: () => {
      // Atualiza os totais (inclusive o "seguindo" de quem clicou) e o feed home, que muda com quem se segue.
      void queryClient.invalidateQueries({ queryKey: followStatsRootKey })
      void queryClient.invalidateQueries({ queryKey: homeFeedKey })
    },
  })
}

export function useUpdateProfile(handle: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profilesApi.updateMe(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKey(handle), profile)
      // O nome de exibição aparece nos posts dos feeds.
      void queryClient.invalidateQueries({ queryKey: feedRootKey })
    },
  })
}
