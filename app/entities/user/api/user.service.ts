import type { UserProfileResponse } from '#shared/types/api'
import { http } from '@shared/api'

export const userService = {
  getProfile: (id: string): Promise<UserProfileResponse> =>
    http<UserProfileResponse>(`/api/users/${encodeURIComponent(id)}`),
}
