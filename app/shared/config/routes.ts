export const routes = {
  home: '/',
  login: '/login',
  user: (id: string): string => `/users/${encodeURIComponent(id)}`,
  post: (id: string): string => `/posts/${encodeURIComponent(id)}`,
} as const
