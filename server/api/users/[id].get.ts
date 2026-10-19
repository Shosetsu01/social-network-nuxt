import type { UserProfileResponse } from '#shared/types/api'
import { MOCK_LATENCY_MS, getUserProfile, simulateLatency } from '../../utils/mock-db'

export default defineEventHandler(async (event): Promise<UserProfileResponse> => {
  const id = getRouterParam(event, 'id', { decode: true }) ?? ''
  await simulateLatency(MOCK_LATENCY_MS.users)

  const profile = getUserProfile(id)
  if (!profile) {
    throw createError({ status: 404, statusText: 'Not Found', message: 'User not found' })
  }
  return profile
})
