import type { UserProfileResponse } from '#shared/types/api'
import type { MediaImage, SoundByte } from '#shared/types/post'
import type { SessionUser, User, UserSummary } from '#shared/types/user'

// Artificial latency keeps loading states visible, as in the original app.
export const MOCK_LATENCY_MS = { login: 600, feed: 400, users: 300, posts: 300 } as const

export const CURRENT_USER_ID = '1'

interface UserSeed {
  email: string
  user: User
  connectionIds: readonly string[]
  soundBytes: readonly SoundByte[]
}

export const HTML_TIP_PART_3: SoundByte = {
  id: 'sb-html-tip-3',
  title: 'HTML 5 Tip - Part 3',
  tag: 'Advice',
  publishedAt: '2020-10-06T07:21:00.000Z',
}

const USER_SEEDS: readonly UserSeed[] = [
  {
    email: 'allan@example.com',
    user: {
      id: '1',
      name: 'Allan Paterson',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      bio: 'Flutter Developer | UI/UX Designer | Coffee Lover',
      role: 'Flutter Developer',
      company: 'Brightline Studio',
      location: 'San Francisco, CA',
      followers: 1247,
      following: 892,
      postsCount: 156,
    },
    connectionIds: ['2', '3', '4', '5', '6'],
    soundBytes: [
      { id: 'sb-flutter-layouts', title: 'Flutter Layouts in 5 Minutes', tag: 'Tutorial', publishedAt: '2020-10-02T09:30:00.000Z' },
      { id: 'sb-design-handoff', title: 'Design Handoff Without Tears', tag: 'Advice', publishedAt: '2020-09-21T16:05:00.000Z' },
    ],
  },
  {
    email: 'sarah.johnson@example.com',
    user: {
      id: '2',
      name: 'Sarah Johnson',
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      bio: 'Designing calm, accessible interfaces. Sketchbook always in my bag.',
      role: 'Product Designer',
      company: 'Brightline Studio',
      location: 'San Francisco, CA',
      followers: 3480,
      following: 512,
      postsCount: 214,
    },
    connectionIds: ['1', '4', '6'],
    soundBytes: [
      { id: 'sb-color-contrast', title: 'Color Contrast Basics', tag: 'Design', publishedAt: '2020-10-04T11:00:00.000Z' },
    ],
  },
  {
    email: 'mike.chen@example.com',
    user: {
      id: '3',
      name: 'Mike Chen',
      avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
      bio: 'Vue and TypeScript enthusiast. Weekend trail runner.',
      role: 'Frontend Engineer',
      company: 'Northwind Labs',
      location: 'Seattle, WA',
      followers: 860,
      following: 430,
      postsCount: 72,
    },
    connectionIds: ['1', '4', '5'],
    soundBytes: [],
  },
  {
    email: 'dina.foster@example.com',
    user: {
      id: '4',
      name: 'Dina Foster',
      avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      bio: 'Helping teams ship faster with better tooling. Speaker and mentor.',
      role: 'Technology Consultant',
      company: 'Dropbox',
      location: 'Austin, TX',
      followers: 15200,
      following: 1204,
      postsCount: 389,
    },
    connectionIds: ['1', '2', '3'],
    soundBytes: [
      { id: 'sb-remote-teams', title: 'Running Remote Teams', tag: 'Leadership', publishedAt: '2020-09-30T14:45:00.000Z' },
    ],
  },
  {
    email: 'matt.redman@example.com',
    user: {
      id: '5',
      name: 'Matt Redman',
      avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
      bio: 'Tech tutorials every week. New videos every Thursday.',
      role: 'Video Creator',
      company: 'Redman Media',
      location: 'London, UK',
      followers: 128400,
      following: 310,
      postsCount: 540,
    },
    connectionIds: ['1', '3'],
    soundBytes: [
      { id: 'sb-video-gear', title: 'My Video Gear Setup', tag: 'Gear', publishedAt: '2020-11-12T18:00:00.000Z' },
    ],
  },
  {
    email: 'chris.pyne@example.com',
    user: {
      id: '6',
      name: 'Chris Pyne',
      avatarUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
      bio: 'Teaching HTML, CSS and JavaScript one bite-sized tip at a time.',
      role: 'Web Developer & Educator',
      company: 'CodeCraft Academy',
      location: 'Toronto, ON',
      followers: 9800,
      following: 640,
      postsCount: 301,
    },
    connectionIds: ['1', '2'],
    soundBytes: [
      HTML_TIP_PART_3,
      { id: 'sb-html-tip-2', title: 'HTML 5 Tip - Part 2', tag: 'Advice', publishedAt: '2020-09-29T07:15:00.000Z' },
    ],
  },
]

function findSeed(id: string): UserSeed | undefined {
  return USER_SEEDS.find(seed => seed.user.id === id)
}

function requireUser(id: string): User {
  const seed = findSeed(id)
  if (!seed) throw new Error(`Mock data references unknown user "${id}"`)
  return seed.user
}

export function summaryOf(id: string): UserSummary {
  const { name, avatarUrl } = requireUser(id)
  return { id, name, avatarUrl }
}

export function picsum(id: number, width: number, height: number, alt: string): MediaImage {
  return { url: `https://picsum.photos/id/${id}/${width}/${height}`, alt, width, height }
}

export function simulateLatency(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getSessionUser(): SessionUser {
  const seed = findSeed(CURRENT_USER_ID)
  if (!seed) throw new Error('Mock data has no current user')
  const { id, name, avatarUrl } = seed.user
  return { id, name, avatarUrl, email: seed.email }
}

export function getUserProfile(id: string): UserProfileResponse | null {
  const seed = findSeed(id)
  if (!seed) return null
  return {
    user: { ...seed.user },
    connections: seed.connectionIds.map(summaryOf),
    soundBytes: seed.soundBytes.map(soundByte => ({ ...soundByte })),
  }
}
