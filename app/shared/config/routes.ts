export const routes = {
  home: '/',
  login: '/login',
  user: (id: string): string => `/users/${encodeURIComponent(id)}`,
} as const
