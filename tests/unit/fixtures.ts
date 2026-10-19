import type { Post } from '#shared/types/post'

export function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 'post-1',
    author: { id: '2', name: 'Sarah Johnson', avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg' },
    activity: null,
    text: 'Hello',
    attachment: null,
    createdAt: '2026-10-19T11:00:00.000Z',
    likes: 10,
    comments: 2,
    shares: 1,
    isLiked: false,
    isBookmarked: false,
    ...overrides,
  }
}
