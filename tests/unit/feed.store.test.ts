import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Post } from '#shared/types/post'
import { postService } from '~/entities/post/api/post.service'
import { useFeedStore } from '~/entities/post/model/feed.store'
import { makePost } from './fixtures'

vi.mock('~/entities/post/api/post.service', () => ({ postService: { getFeed: vi.fn() } }))

const getFeed = vi.mocked(postService.getFeed)
const POSTS = [makePost({ id: 'post-1', likes: 10 }), makePost({ id: 'post-2', likes: 3 })]

describe('useFeedStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    getFeed.mockReset()
  })

  it('starts idle and empty', () => {
    const feed = useFeedStore()

    expect(feed.posts).toEqual([])
    expect(feed.status).toBe('idle')
    expect(feed.error).toBeNull()
  })

  it('ensureLoaded fetches once and does not refetch after success', async () => {
    getFeed.mockResolvedValue(POSTS)
    const feed = useFeedStore()

    await feed.ensureLoaded()
    await feed.ensureLoaded()

    expect(getFeed).toHaveBeenCalledTimes(1)
    expect(feed.status).toBe('success')
    expect(feed.posts).toEqual(POSTS)
  })

  it('ensureLoaded does not start a second request while one is pending', async () => {
    let resolve: (posts: Post[]) => void = () => {}
    getFeed.mockReturnValue(new Promise((done) => { resolve = done }))
    const feed = useFeedStore()

    const first = feed.ensureLoaded()
    expect(feed.status).toBe('pending')
    await feed.ensureLoaded()
    resolve(POSTS)
    await first

    expect(getFeed).toHaveBeenCalledTimes(1)
    expect(feed.status).toBe('success')
  })

  it('switches to the error state with the UI message when loading fails', async () => {
    getFeed.mockRejectedValue(new Error('Network error'))
    const feed = useFeedStore()

    await feed.ensureLoaded()

    expect(feed.status).toBe('error')
    expect(feed.error).toBe('Could not load the feed.')
    expect(feed.posts).toEqual([])
  })

  it('reload refetches after an error and clears it', async () => {
    getFeed.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce(POSTS)
    const feed = useFeedStore()

    await feed.ensureLoaded()
    await feed.reload()

    expect(getFeed).toHaveBeenCalledTimes(2)
    expect(feed.status).toBe('success')
    expect(feed.error).toBeNull()
    expect(feed.posts).toEqual(POSTS)
  })

  it('toggleLike adds and removes one like without mutating previous state', async () => {
    getFeed.mockResolvedValue(POSTS)
    const feed = useFeedStore()
    await feed.ensureLoaded()
    const before = feed.posts

    feed.toggleLike('post-1')

    expect(feed.posts).not.toBe(before)
    expect(feed.posts[0]).toMatchObject({ isLiked: true, likes: 11 })
    expect(before[0]).toMatchObject({ isLiked: false, likes: 10 })
    expect(feed.posts[1]).toStrictEqual(before[1])

    feed.toggleLike('post-1')

    expect(feed.posts[0]).toMatchObject({ isLiked: false, likes: 10 })
  })

  it('toggleLike ignores unknown ids', async () => {
    getFeed.mockResolvedValue(POSTS)
    const feed = useFeedStore()
    await feed.ensureLoaded()

    feed.toggleLike('missing')

    expect(feed.posts).toEqual(POSTS)
  })

  it('toggleBookmark flips only the bookmark flag', async () => {
    getFeed.mockResolvedValue(POSTS)
    const feed = useFeedStore()
    await feed.ensureLoaded()

    feed.toggleBookmark('post-2')

    expect(feed.posts[1]).toEqual({ ...POSTS[1], isBookmarked: true })
    expect(feed.posts[0]).toEqual(POSTS[0])
  })

  it('reset returns to the initial state so the next ensureLoaded refetches', async () => {
    getFeed.mockResolvedValue(POSTS)
    const feed = useFeedStore()
    await feed.ensureLoaded()

    feed.reset()

    expect(feed.posts).toEqual([])
    expect(feed.status).toBe('idle')
    expect(feed.error).toBeNull()

    await feed.ensureLoaded()

    expect(getFeed).toHaveBeenCalledTimes(2)
  })
})
