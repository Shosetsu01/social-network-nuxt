import type { Post, PostComment, SoundByte } from './post'
import type { SessionUser, User, UserSummary } from './user'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: SessionUser
}

export interface UserProfileResponse {
  user: User
  connections: UserSummary[]
  soundBytes: SoundByte[]
}

export interface FeedPage {
  posts: Post[]
  /** Pass as `cursor` to get the next page; null on the last page. */
  nextCursor: string | null
}

export interface PostDetailsResponse {
  post: Post
  /** Every comment of the post, oldest first: `comments.length === post.comments`. */
  comments: PostComment[]
}
