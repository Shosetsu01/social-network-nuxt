import type { LoginRequest, LoginResponse } from '#shared/types/api'
import { http } from '@shared/api'

export const sessionService = {
  login: (body: LoginRequest): Promise<LoginResponse> =>
    http<LoginResponse>('/api/auth/login', { method: 'POST', body }),
}
