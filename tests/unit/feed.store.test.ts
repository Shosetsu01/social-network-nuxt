import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FeedPage } from '#shared/types/api'
import type { Post } from '#shared/types/post'
import { postService } from '@entities/post/api/post.service'
import { useFeedStore } from '@entities/post/model/feed.store'
import { makePost } from './fixtures'

vi.mock('@entities/post/api/post.service', () => ({ postService: { getFeed: vi.fn(), getPost: vi.fn() } }))

const getFeed = vi.mocked(postService.getFeed)
const POSTS = [makePost({ id: 'post-1', likes: 10 }), makePost({ id: 'post-2', likes: 3 })]
const NEXT_POSTS = [makePost({ id: 'post-3' }), makePost({ id: 'post-4' })]

function page(posts: Post[], nextCursor: string | null = null): FeedPage {
  return { posts, nextCursor }
}

/** A response held until the test resolves it. */
function deferred(): { promise: Promise<FeedPage>, resolve: (value: FeedPage) => void, reject: (reason: Error) => void } {
  let resolve: (value: FeedPage) => void = () => {}
  let reject: (reason: Error) => void = () => {}
  const promise = new Promise<FeedPage>((done, fail) => {
    resolve = done
    reject = fail
  })
  return { promise, resolve, reject }
}

async function loadedStore(first: FeedPage = page(POSTS, 'post-3')): Promise<ReturnType<typeof useFeedStore>> {
  getFeed.mockResolvedValueOnce(first)
  const feed = useFeedStore()
  await feed.ensureLoaded()
  return feed
}

describe('useFeedStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    getFeed.mockReset()
  })

  it('starts idle and empty', () => {
    const feed = useFeedStore()

    expect(feed.posts).toEqual([])
    expect(feed.status).toBe('idle')
    expect(feed.loadMoreStatus).toBe('idle')
    expect(feed.hasMore).toBe(false)
    expect(feed.error).toBeNull()
  })

  it('ensureLoaded fetches the first page once and does not refetch after success', async () => {
    const feed = await loadedStore()
    await feed.ensureLoaded()

    expect(getFeed).toHaveBeenCalledTimes(1)
    expect(getFeed).toHaveBeenCalledWith()
    expect(feed.status).toBe('success')
    expect(feed.posts).toEqual(POSTS)
    expect(feed.hasMore).toBe(true)
  })

  it('ensureLoaded does not start a second request while one is pending', async () => {
    const request = deferred()
    getFeed.mockReturnValue(request.promise)
    const feed = useFeedStore()

    const first = feed.ensureLoaded()
    expect(feed.status).toBe('pending')
    await feed.ensureLoaded()
    request.resolve(page(POSTS))
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
    getFeed.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce(page(POSTS))
    const feed = useFeedStore()

    await feed.ensureLoaded()
    await feed.reload()

    expect(getFeed).toHaveBeenCalledTimes(2)
    expect(feed.status).toBe('success')
    expect(feed.error).toBeNull()
    expect(feed.posts).toEqual(POSTS)
  })

  it('toggleLike adds and removes one like without mutating previous state', async () => {
    const feed = await loadedStore()
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
    const feed = await loadedStore()

    feed.toggleLike('missing')

    expect(feed.posts).toEqual(POSTS)
  })

  it('toggleBookmark flips only the bookmark flag', async () => {
    const feed = await loadedStore()

    feed.toggleBookmark('post-2')

    expect(feed.posts[1]).toEqual({ ...POSTS[1], isBookmarked: true })
    expect(feed.posts[0]).toEqual(POSTS[0])
  })

  it('drops a response that arrives after reset and loads again on the next ensureLoaded', async () => {
    const stale = deferred()
    const freshPosts = [makePost({ id: 'post-3' })]
    getFeed.mockReturnValueOnce(stale.promise).mockResolvedValueOnce(page(freshPosts))
    const feed = useFeedStore()

    const staleLoad = feed.ensureLoaded()
    feed.reset()
    stale.resolve(page(POSTS, 'post-3'))
    await staleLoad

    expect(feed.status).toBe('idle')
    expect(feed.posts).toEqual([])
    expect(feed.hasMore).toBe(false)

    await feed.ensureLoaded()

    expect(getFeed).toHaveBeenCalledTimes(2)
    expect(feed.status).toBe('success')
    expect(feed.posts).toEqual(freshPosts)
  })

  it('keeps the newer feed when a request from before reset resolves late', async () => {
    const stale = deferred()
    const freshPosts = [makePost({ id: 'post-3' })]
    getFeed.mockReturnValueOnce(stale.promise).mockResolvedValueOnce(page(freshPosts))
    const feed = useFeedStore()

    const staleLoad = feed.ensureLoaded()
    feed.reset()
    await feed.ensureLoaded()
    stale.resolve(page(POSTS))
    await staleLoad

    expect(feed.status).toBe('success')
    expect(feed.posts).toEqual(freshPosts)
  })

  it('reset returns to the initial state, cursor included, so the next ensureLoaded refetches', async () => {
    const feed = await loadedStore()
    feed.upsertPost(makePost({ id: 'post-9' }))

    feed.reset()

    expect(feed.posts).toEqual([])
    expect(feed.getPost('post-9')).toBeUndefined()
    expect(feed.status).toBe('idle')
    expect(feed.hasMore).toBe(false)
    expect(feed.error).toBeNull()

    getFeed.mockResolvedValueOnce(page(POSTS))
    await feed.ensureLoaded()

    expect(getFeed).toHaveBeenCalledTimes(2)
  })

  describe('loadMore', () => {
    it('requests the next cursor and appends the page', async () => {
      const feed = await loadedStore()
      getFeed.mockResolvedValueOnce(page(NEXT_POSTS, 'post-5'))

      await feed.loadMore()

      expect(getFeed).toHaveBeenLastCalledWith('post-3')
      expect(feed.posts.map(post => post.id)).toEqual(['post-1', 'post-2', 'post-3', 'post-4'])
      expect(feed.loadMoreStatus).toBe('idle')
      expect(feed.hasMore).toBe(true)
    })

    it('does not duplicate posts the feed already shows', async () => {
      const feed = await loadedStore()
      getFeed.mockResolvedValueOnce(page([makePost({ id: 'post-2' }), ...NEXT_POSTS]))

      await feed.loadMore()

      expect(feed.posts.map(post => post.id)).toEqual(['post-1', 'post-2', 'post-3', 'post-4'])
    })

    it('stops at the last page', async () => {
      const feed = await loadedStore()
      getFeed.mockResolvedValueOnce(page(NEXT_POSTS, null))

      await feed.loadMore()
      await feed.loadMore()

      expect(feed.hasMore).toBe(false)
      expect(getFeed).toHaveBeenCalledTimes(2)
    })

    it('does nothing before the first page has loaded', async () => {
      const feed = useFeedStore()

      await feed.loadMore()

      expect(getFeed).not.toHaveBeenCalled()
      expect(feed.loadMoreStatus).toBe('idle')
    })

    it('does not start a second request while one is pending', async () => {
      const feed = await loadedStore()
      const request = deferred()
      getFeed.mockReturnValueOnce(request.promise)

      const first = feed.loadMore()
      expect(feed.loadMoreStatus).toBe('pending')
      await feed.loadMore()
      request.resolve(page(NEXT_POSTS))
      await first

      expect(getFeed).toHaveBeenCalledTimes(2)
    })

    it('keeps loaded posts on failure and recovers on the next call', async () => {
      const feed = await loadedStore()
      getFeed.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce(page(NEXT_POSTS))

      await feed.loadMore()

      expect(feed.loadMoreStatus).toBe('error')
      expect(feed.status).toBe('success')
      expect(feed.posts).toEqual(POSTS)
      expect(feed.hasMore).toBe(true)

      await feed.loadMore()

      expect(feed.loadMoreStatus).toBe('idle')
      expect(feed.posts).toHaveLength(4)
    })

    it('drops a page that arrives after reset', async () => {
      const feed = await loadedStore()
      const request = deferred()
      getFeed.mockReturnValueOnce(request.promise)

      const loading = feed.loadMore()
      feed.reset()
      request.resolve(page(NEXT_POSTS, 'post-5'))
      await loading

      expect(feed.posts).toEqual([])
      expect(feed.loadMoreStatus).toBe('idle')
      expect(feed.hasMore).toBe(false)
    })

    it('drops a failure that arrives after reload, so loadMoreStatus does not stay stuck', async () => {
      const feed = await loadedStore()
      const request = deferred()
      getFeed.mockReturnValueOnce(request.promise).mockResolvedValueOnce(page(POSTS, 'post-3'))

      const loading = feed.loadMore()
      await feed.reload()
      request.reject(new Error('Network error'))
      await loading

      expect(feed.loadMoreStatus).toBe('idle')
      expect(feed.status).toBe('success')
    })
  })

  describe('merging', () => {
    it('upsertPost adds a post that getPost can read, without putting it in the feed', () => {
      const feed = useFeedStore()
      const post = makePost({ id: 'post-20' })

      feed.upsertPost(post)

      expect(feed.getPost('post-20')).toEqual(post)
      expect(feed.posts).toEqual([])
    })

    it('upsertPost keeps the local record: a like is not undone by the server copy', async () => {
      const feed = await loadedStore()
      feed.toggleLike('post-1')

      feed.upsertPost(makePost({ id: 'post-1', likes: 10, isLiked: false }))

      expect(feed.getPost('post-1')).toMatchObject({ isLiked: true, likes: 11 })
    })

    it('a post liked on its own page keeps the like when the feed loads it', async () => {
      const feed = useFeedStore()
      feed.upsertPost(makePost({ id: 'post-1', likes: 10 }))
      feed.toggleLike('post-1')
      getFeed.mockResolvedValueOnce(page(POSTS))

      await feed.ensureLoaded()

      expect(feed.posts[0]).toMatchObject({ id: 'post-1', isLiked: true, likes: 11 })
      expect(feed.posts[1]).toEqual(POSTS[1])
    })

    it('getPost returns undefined for unknown ids and treats prototype names as ordinary ids', () => {
      const feed = useFeedStore()

      expect(feed.getPost('missing')).toBeUndefined()
      feed.upsertPost(makePost({ id: 'constructor' }))
      expect(feed.getPost('constructor')).toMatchObject({ id: 'constructor' })
    })
  })
})
