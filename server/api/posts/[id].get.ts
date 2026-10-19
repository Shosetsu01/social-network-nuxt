import type { PostDetailsResponse } from '#shared/types/api'
import { MOCK_LATENCY_MS, simulateLatency } from '../../utils/mock-db'
import { getPostDetails } from '../../utils/mock-posts'

export default defineEventHandler(async (event): Promise<PostDetailsResponse> => {
  const id = getRouterParam(event, 'id', { decode: true }) ?? ''
  await simulateLatency(MOCK_LATENCY_MS.posts)

  const details = getPostDetails(Date.now(), id)
  if (!details) {
    throw createError({ status: 404, statusText: 'Not Found', message: 'Post not found' })
  }
  return details
})
