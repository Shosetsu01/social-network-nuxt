import { describe, expect, it } from 'vitest'
import type { MediaImage, Post } from '#shared/types/post'
import { getFeed, getSessionUser, getUserProfile } from '../../server/utils/mock-db'

const NOW = Date.parse('2026-10-19T12:00:00.000Z')

function imagesOf(post: Post): MediaImage[] {
  switch (post.attachment?.type) {
    case 'image': return [post.attachment.image]
    case 'gallery': return post.attachment.images
    case 'video': return [post.attachment.poster]
    default: return []
  }
}

describe('getFeed', () => {
  const feed = getFeed(NOW)

  it('returns exactly 6 posts with unique ids from different authors', () => {
    expect(feed).toHaveLength(6)
    expect(new Set(feed.map(post => post.id)).size).toBe(6)
    expect(new Set(feed.map(post => post.author.id)).size).toBe(6)
  })

  it('covers every attachment and activity variant of the original feed', () => {
    const attachments = feed.map(post => post.attachment?.type ?? null)
    expect(attachments).toEqual(expect.arrayContaining(['image', 'gallery', 'video', 'sound-byte']))
    expect(feed.map(post => post.activity?.type ?? null)).toEqual(
      expect.arrayContaining(['connection', 'check-in', null]),
    )
    const gallery = feed.find(post => post.attachment?.type === 'gallery')
    expect(gallery && imagesOf(gallery)).toHaveLength(3)
    const checkIn = feed.find(post => post.activity?.type === 'check-in')
    expect(checkIn?.activity).toMatchObject({ place: expect.any(String) })
  })

  it('keeps the original sound byte post texts', () => {
    const post = feed.find(item => item.attachment?.type === 'sound-byte')
    expect(post?.text).toBe('Here\'s Part 3 Of HTML Mini Series. Hope You all will enjoy')
    expect(post?.attachment).toMatchObject({ soundByte: { title: 'HTML 5 Tip - Part 3', tag: 'Advice' } })
  })

  it('dates posts relative to the request time, newest first', () => {
    const times = feed.map(post => Date.parse(post.createdAt))
    expect(times.every(time => time < NOW)).toBe(true)
    expect(times).toEqual([...times].sort((a, b) => b - a))
  })

  it('references only existing users', () => {
    const ids = feed.flatMap(post => [post.author.id, post.activity?.target.id ?? post.author.id])
    expect(ids.every(id => getUserProfile(id) !== null)).toBe(true)
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

describe('getUserProfile', () => {
  it('returns the current user with the original bio', () => {
    expect(getUserProfile('1')?.user).toMatchObject({
      id: '1',
      name: 'Allan Paterson',
      bio: 'Flutter Developer | UI/UX Designer | Coffee Lover',
    })
    expect(getUserProfile('1')?.user).not.toHaveProperty('email')
  })

  it.each(['2', '3', '4', '5', '6'])('returns user %s with connections as summaries', (id) => {
    const profile = getUserProfile(id)
    expect(profile?.user.id).toBe(id)
    expect(profile?.connections.length).toBeGreaterThan(0)
    for (const connection of profile?.connections ?? []) {
      expect(Object.keys(connection).sort()).toEqual(['avatarUrl', 'id', 'name'])
      expect(connection.id).not.toBe(id)
    }
  })

  it.each(['999', '__proto__', 'constructor', ''])('returns null for unknown id %j', (id) => {
    expect(getUserProfile(id)).toBeNull()
  })
})

describe('getSessionUser', () => {
  it('returns user 1 without profile-only fields', () => {
    expect(getSessionUser()).toEqual({
      id: '1',
      name: 'Allan Paterson',
      email: 'allan@example.com',
      avatarUrl: expect.stringMatching(/^https:\/\/randomuser\.me\/api\/portraits\/(men|women)\/\d+\.jpg$/),
    })
  })
})
