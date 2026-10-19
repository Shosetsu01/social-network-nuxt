import { describe, expect, it } from 'vitest'
import type { MediaImage, Post } from '#shared/types/post'
import { getUserProfile } from '../../server/utils/mock-db'
import { FEED_PAGE_SIZE, getFeed, getFeedPage } from '../../server/utils/mock-posts'

const NOW = Date.parse('2026-10-19T12:00:00.000Z')
const POST_COUNT = 30
const ORIGINAL_IDS = ['post-1', 'post-2', 'post-3', 'post-4', 'post-5', 'post-6']

function imagesOf(post: Post): MediaImage[] {
  switch (post.attachment?.type) {
    case 'image': return [post.attachment.image]
    case 'gallery': return post.attachment.images
    case 'video': return [post.attachment.poster]
    default: return []
  }
}

function collectPages(now: number): { pages: Post[][], cursors: (string | null)[] } {
  const pages: Post[][] = []
  const cursors: (string | null)[] = []
  let cursor: string | undefined
  for (let guard = 0; guard < POST_COUNT; guard += 1) {
    const page = getFeedPage(now, cursor)
    if (!page) throw new Error(`Unexpected invalid cursor ${String(cursor)}`)
    pages.push(page.posts)
    cursors.push(page.nextCursor)
    if (page.nextCursor === null) break
    cursor = page.nextCursor
  }
  return { pages, cursors }
}

describe('getFeed', () => {
  const feed = getFeed(NOW)

  it('returns 30 posts with unique ids, newest first', () => {
    expect(feed).toHaveLength(POST_COUNT)
    expect(new Set(feed.map(post => post.id)).size).toBe(POST_COUNT)
    const times = feed.map(post => Date.parse(post.createdAt))
    expect(times.every(time => time < NOW)).toBe(true)
    expect(times).toEqual([...times].sort((a, b) => b - a))
  })

  it('keeps the original six posts first, from six different authors', () => {
    const first = feed.slice(0, FEED_PAGE_SIZE)
    expect(first.map(post => post.id)).toEqual(ORIGINAL_IDS)
    expect(new Set(first.map(post => post.author.id)).size).toBe(6)
    expect(first.map(post => [post.likes, post.comments])).toEqual([[45, 12], [32, 8], [18, 5], [64, 21], [27, 6], [112, 45]])
  })

  it('covers every attachment and activity variant of the original feed', () => {
    const attachments = feed.map(post => post.attachment?.type ?? null)
    expect(attachments).toEqual(expect.arrayContaining(['image', 'gallery', 'video', 'sound-byte', null]))
    expect(feed.map(post => post.activity?.type ?? null)).toEqual(
      expect.arrayContaining(['connection', 'check-in', null]),
    )
    for (const post of feed.filter(item => item.attachment?.type === 'gallery')) {
      expect(imagesOf(post)).toHaveLength(3)
    }
    for (const post of feed.filter(item => item.activity?.type === 'check-in')) {
      expect(post.activity).toMatchObject({ place: expect.any(String) })
    }
  })

  it('keeps the original sound byte post texts', () => {
    const post = feed.find(item => item.id === 'post-4')
    expect(post?.text).toBe('Here\'s Part 3 Of HTML Mini Series. Hope You all will enjoy')
    expect(post?.attachment).toMatchObject({ soundByte: { title: 'HTML 5 Tip - Part 3', tag: 'Advice' } })
  })

  it('references only existing users and never connects authors to themselves', () => {
    const ids = feed.flatMap(post => [post.author.id, post.activity?.target.id ?? post.author.id])
    expect(ids.every(id => getUserProfile(id) !== null)).toBe(true)
    expect(feed.every(post => post.activity?.target.id !== post.author.id)).toBe(true)
  })

  it('describes every image with its real size', () => {
    const images = feed.flatMap(imagesOf)
    expect(images.length).toBeGreaterThan(0)
    for (const image of images) {
      expect(image.url).toBe(`https://picsum.photos/id/${image.url.split('/')[4]}/${image.width}/${image.height}`)
      expect(image.alt).not.toBe('')
    }
  })

  it('returns fresh objects on every call', () => {
    expect(getFeed(NOW)).toEqual(feed)
    expect(getFeed(NOW)[0]).not.toBe(feed[0])
  })
})

describe('getFeedPage', () => {
  it('serves the original six posts on the first page', () => {
    const page = getFeedPage(NOW, undefined)
    expect(page?.posts.map(post => post.id)).toEqual(ORIGINAL_IDS)
    expect(page?.nextCursor).toEqual(expect.any(String))
  })

  it('walks the whole feed in pages of six and ends with a null cursor', () => {
    const { pages, cursors } = collectPages(NOW)

    expect(pages).toHaveLength(POST_COUNT / FEED_PAGE_SIZE)
    expect(pages.every(page => page.length === FEED_PAGE_SIZE)).toBe(true)
    expect(pages.flat().map(post => post.id)).toEqual(getFeed(NOW).map(post => post.id))
    expect(cursors.at(-1)).toBeNull()
    expect(cursors.slice(0, -1).every(cursor => typeof cursor === 'string')).toBe(true)
  })

  it('keeps cursors valid when the request time moves on', () => {
    const cursor = getFeedPage(NOW, undefined)?.nextCursor
    const later = getFeedPage(NOW + 60 * 60 * 1000, cursor)
    expect(later?.posts[0]?.id).toBe('post-7')
  })

  it.each([
    ['an unknown id', 'post-999'],
    ['an empty string', ''],
    ['a prototype key', '__proto__'],
    ['a repeated parameter', ['post-7', 'post-13']],
    ['a number', 7],
  ])('rejects %s as a cursor', (_, cursor) => {
    expect(getFeedPage(NOW, cursor)).toBeNull()
  })
})
