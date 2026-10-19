import type { Post } from '#shared/types/post'

export function withToggledLike(post: Post): Post {
  return { ...post, isLiked: !post.isLiked, likes: post.likes + (post.isLiked ? -1 : 1) }
}

export function withToggledBookmark(post: Post): Post {
  return { ...post, isBookmarked: !post.isBookmarked }
}
