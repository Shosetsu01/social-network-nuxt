export interface UserSummary {
  id: string
  name: string
  avatarUrl: string
}

export interface User extends UserSummary {
  bio: string
  role: string
  company: string
  location: string
  followers: number
  following: number
  postsCount: number
}

export interface SessionUser extends UserSummary {
  email: string
}
