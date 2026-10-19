import { describe, expect, it } from 'vitest'
import { withToggledBookmark, withToggledLike } from '@entities/post/lib/post'
import { makePost } from './fixtures'

describe('withToggledLike', () => {
  it('likes a post and increments the counter in a new object', () => {
    const post = Object.freeze(makePost({ likes: 10, isLiked: false }))

    const result = withToggledLike(post)

    expect(result).not.toBe(post)
    expect(result).toMatchObject({ isLiked: true, likes: 11 })
    expect(post).toMatchObject({ isLiked: false, likes: 10 })
  })

  it('unlikes a liked post and decrements the counter', () => {
    const post = Object.freeze(makePost({ likes: 11, isLiked: true }))

    expect(withToggledLike(post)).toMatchObject({ isLiked: false, likes: 10 })
  })
})

describe('withToggledBookmark', () => {
  it('flips the bookmark flag in a new object and keeps the rest', () => {
    const post = Object.freeze(makePost({ isBookmarked: false }))

    const result = withToggledBookmark(post)

    expect(result).not.toBe(post)
    expect(result).toEqual({ ...post, isBookmarked: true })
    expect(withToggledBookmark(result).isBookmarked).toBe(false)
  })
})
