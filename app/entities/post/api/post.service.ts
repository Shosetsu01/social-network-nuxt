import type { FeedPage } from '#shared/types/api'
import { http } from '@shared/api'

export const postService = {
  // The first page is exactly `/api/feed`, with no query.
  getFeed: (cursor?: string): Promise<FeedPage> =>
    http<FeedPage>('/api/feed', { query: cursor === undefined ? undefined : { cursor } }),
}
