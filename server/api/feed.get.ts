import type { FeedPage } from '#shared/types/api'
import { MOCK_LATENCY_MS, simulateLatency } from '../utils/mock-db'
import { getFeedPage } from '../utils/mock-posts'

export default defineEventHandler(async (event): Promise<FeedPage> => {
  const { cursor } = getQuery(event)
  await simulateLatency(MOCK_LATENCY_MS.feed)

  const page = getFeedPage(Date.now(), cursor)
  if (!page) {
    throw createError({ status: 400, statusText: 'Bad Request', message: 'Invalid cursor' })
  }
  return page
})
