import type { Post } from '#shared/types/post'
import { http } from '@shared/api'

export const postService = {
  getFeed: (): Promise<Post[]> => http<Post[]>('/api/feed'),
}
