import type { LoginRequest } from '#shared/types/api'
import type { SessionUser } from '#shared/types/user'
import { sessionService } from '../api/session.service'

const SESSION_COOKIE = 'socio_session'
const PERSISTENT_SESSION_COOKIE = 'socio_session_persist'
const PERSISTENT_SESSION_MAX_AGE_S = 60 * 60 * 24 * 30

/**
 * Both cookies hold a SessionUser as JSON: `{ id, name, avatarUrl, email }`, all strings.
 * useCookie (de)serialises it itself; on the wire the value is `encodeURIComponent(JSON.stringify(user))`.
 */
function isSessionUser(value: unknown): value is SessionUser {
  return typeof value === 'object'
    && value !== null
    && 'id' in value && typeof value.id === 'string'
    && 'name' in value && typeof value.name === 'string'
    && 'avatarUrl' in value && typeof value.avatarUrl === 'string'
    && 'email' in value && typeof value.email === 'string'
}

export const useSessionStore = defineStore('session', () => {
  // Declared synchronously in setup: useCookie loses the Nuxt context after an await.
  // Typed as unknown because cookies are client-controlled; `user` validates the shape.
  const sessionCookie = useCookie<unknown>(SESSION_COOKIE, { default: () => null, sameSite: 'lax' })
  const persistentCookie = useCookie<unknown>(PERSISTENT_SESSION_COOKIE, {
    default: () => null,
    sameSite: 'lax',
    maxAge: PERSISTENT_SESSION_MAX_AGE_S,
  })

  const user = computed(() => [persistentCookie.value, sessionCookie.value].find(isSessionUser) ?? null)
  const isAuthenticated = computed(() => user.value !== null)

  async function login({ remember, ...credentials }: LoginRequest & { remember: boolean }): Promise<void> {
    const response = await sessionService.login(credentials)
    // Exactly one cookie holds the session, so unticking "Remember me" drops the persistent one.
    sessionCookie.value = remember ? null : response.user
    persistentCookie.value = remember ? response.user : null
  }

  function logout(): void {
    sessionCookie.value = null
    persistentCookie.value = null
  }

  return { user, isAuthenticated, login, logout }
})
