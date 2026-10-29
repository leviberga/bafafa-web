export interface Account {
  id: string
  email: string
  handle: string
}

export interface RegisterInput {
  email: string
  password: string
  handle: string
  displayName: string
}

export interface Actor {
  id: string
  handle: string
  displayName: string
}

export interface Engagement {
  likeCount: number
  repostCount: number
  likedByMe: boolean
  repostedByMe: boolean
}

export interface PostCardData {
  id: string
  author: Actor
  text: string
  createdAt: string
  engagement: Engagement
}

/** Em REPOST, `post` é o post original e `repostedBy` quem repostou. Em REPLY, é uma resposta listada numa thread. */
export interface TimelineItem {
  kind: 'POST' | 'REPOST' | 'REPLY'
  post: PostCardData
  repostedBy: Actor | null
}

export interface TimelinePage {
  items: TimelineItem[]
  nextCursor: string | null
}

export interface CreatedPost {
  id: string
  authorId: string
  type: string
  text: string | null
  createdAt: string
}

export interface Profile {
  handle: string
  displayName: string
  bio: string
  createdAt: string
}

export interface UpdateProfileInput {
  displayName: string
  bio: string
}

export interface FollowStats {
  followerCount: number
  followingCount: number
  followedByMe: boolean
}

/** O post a que uma resposta responde. `author` é nulo se esse post foi apagado. */
export interface ReplyContext {
  postId: string
  author: Actor | null
}

export interface PostThread {
  post: PostCardData
  inReplyTo: ReplyContext | null
}
