import type { LoginResponse } from '#shared/types/api'
import { isLoginRequest, validateEmail, validatePassword } from '#shared/utils/validation'
import { MOCK_LATENCY_MS, getSessionUser, simulateLatency } from '../../utils/mock-db'

// Mock auth like the original app: any valid email and password sign in as the current user.
export default defineEventHandler(async (event): Promise<LoginResponse> => {
  const body: unknown = await readBody(event)
  await simulateLatency(MOCK_LATENCY_MS.login)

  if (!isLoginRequest(body)) {
    throw createError({ status: 400, statusText: 'Bad Request', message: 'Email and password are required' })
  }
  const message = validateEmail(body.email) ?? validatePassword(body.password)
  if (message) {
    throw createError({ status: 400, statusText: 'Bad Request', message })
  }

  return { user: getSessionUser() }
})
