import { request, setAccessToken } from './api'
import type {
  Account,
  CreatedPost,
  FollowStats,
  PostThread,
  Profile,
  RegisterInput,
  TimelinePage,
  UpdateProfileInput,
} from './types'

export const authApi = {
  async login(identifier: string, password: string): Promise<void> {
    const data = await request<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: { identifier, password },
      auth: false,
    })
    setAccessToken(data.accessToken)
  },

  register(input: RegisterInput) {
    return request<Account>('/auth/register', { method: 'POST', body: input, auth: false })
  },

  me() {
    return request<Account>('/auth/me')
  },

  async logout(): Promise<void> {
    try {
      await request<void>('/auth/logout', { method: 'POST', auth: false })
    } finally {
      setAccessToken(null)
    }
  },
}

function pageQuery(cursor?: string): string {
  const query = new URLSearchParams({ limit: '20' })
  if (cursor) {
    query.set('cursor', cursor)
  }
  return query.toString()
}

export const timelineApi = {
  home(cursor?: string) {
    return request<TimelinePage>(`/timeline/home?${pageQuery(cursor)}`)
  },
  post(id: string) {
    return request<PostThread>(`/timeline/posts/${encodeURIComponent(id)}`)
  },
  replies(id: string, cursor?: string) {
    return request<TimelinePage>(`/timeline/posts/${encodeURIComponent(id)}/replies?${pageQuery(cursor)}`)
  },
  ofUser(handle: string, cursor?: string) {
    return request<TimelinePage>(`/timeline/users/${encodeURIComponent(handle)}?${pageQuery(cursor)}`)
  },
}

export const profilesApi = {
  get(handle: string) {
    return request<Profile>(`/profiles/${encodeURIComponent(handle)}`)
  },
  followStats(handle: string) {
    return request<FollowStats>(`/profiles/${encodeURIComponent(handle)}/follow-stats`)
  },
  follow(handle: string) {
    return request<void>(`/profiles/${encodeURIComponent(handle)}/follow`, { method: 'PUT' })
  },
  unfollow(handle: string) {
    return request<void>(`/profiles/${encodeURIComponent(handle)}/follow`, { method: 'DELETE' })
  },
  updateMe(input: UpdateProfileInput) {
    return request<Profile>('/profiles/me', { method: 'PUT', body: input })
  },
}

export const postsApi = {
  create(text: string) {
    return request<CreatedPost>('/posts', { method: 'POST', body: { text } })
  },
  reply(postId: string, text: string) {
    return request<CreatedPost>(`/posts/${postId}/replies`, { method: 'POST', body: { text } })
  },
  like(postId: string) {
    return request<void>(`/posts/${postId}/like`, { method: 'PUT' })
  },
  unlike(postId: string) {
    return request<void>(`/posts/${postId}/like`, { method: 'DELETE' })
  },
  repost(postId: string) {
    return request<unknown>(`/posts/${postId}/repost`, { method: 'PUT' })
  },
  unrepost(postId: string) {
    return request<void>(`/posts/${postId}/repost`, { method: 'DELETE' })
  },
}
