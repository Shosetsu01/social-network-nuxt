import { describe, expect, it } from 'vitest'
import { getSessionUser, getUserProfile } from '../../server/utils/mock-db'

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
