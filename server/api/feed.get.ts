import type { Post } from '#shared/types/post'
import { MOCK_LATENCY_MS, getFeed, simulateLatency } from '../utils/mock-db'

export default defineEventHandler(async (): Promise<Post[]> => {
  await simulateLatency(MOCK_LATENCY_MS.feed)
  return getFeed(Date.now())
})
