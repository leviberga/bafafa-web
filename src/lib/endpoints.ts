import { request, setAccessToken } from './api'
import type { Account, CreatedPost, RegisterInput, TimelinePage } from './types'

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

export const timelineApi = {
  home(cursor?: string) {
    const query = new URLSearchParams({ limit: '20' })
    if (cursor) {
      query.set('cursor', cursor)
    }
    return request<TimelinePage>(`/timeline/home?${query.toString()}`)
  },
}

export const postsApi = {
  create(text: string) {
    return request<CreatedPost>('/posts', { method: 'POST', body: { text } })
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
