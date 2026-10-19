import type { SoundByte } from './post'
import type { SessionUser, User, UserSummary } from './user'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: SessionUser
}

export interface UserProfileResponse {
  user: User
  connections: UserSummary[]
  soundBytes: SoundByte[]
}
