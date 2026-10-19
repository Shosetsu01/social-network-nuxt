import { useSessionStore } from '@entities/session'
import { routes } from '@shared/config'

// Runs on the server for the first request and on the client for every navigation.
export default defineNuxtRouteMiddleware((to) => {
  const session = useSessionStore()
  // Matched by route record, so `/login/` counts as the login page too.
  const isLoginPage = to.matched.some(record => record.path === routes.login)

  if (session.isAuthenticated) {
    return isLoginPage ? navigateTo(routes.home, { replace: true }) : undefined
  }
  if (isLoginPage) return undefined

  // The target is only carried here; the login page re-validates it with safeRedirect before use.
  const loginPath = to.fullPath === routes.home
    ? routes.login
    : `${routes.login}?redirect=${encodeURIComponent(to.fullPath)}`
  return navigateTo(loginPath, { replace: true })
})
