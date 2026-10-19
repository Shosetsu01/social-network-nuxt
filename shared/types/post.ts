import type { UserSummary } from './user'

export interface MediaImage {
  url: string
  alt: string
  width: number
  height: number
}

export interface SoundByte {
  id: string
  title: string
  tag: string
  /** ISO 8601 */
  publishedAt: string
}

export type PostActivity =
  | { type: 'connection', target: UserSummary, othersCount: number }
  | { type: 'check-in', target: UserSummary, othersCount: number, place: string }

export type PostAttachment =
  | { type: 'image', image: MediaImage }
  | { type: 'gallery', images: MediaImage[] }
  | { type: 'video', poster: MediaImage }
  | { type: 'sound-byte', soundByte: SoundByte }

export interface Post {
  id: string
  author: UserSummary
  activity: PostActivity | null
  text: string | null
  attachment: PostAttachment | null
  /** ISO 8601 */
  createdAt: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isBookmarked: boolean
}
