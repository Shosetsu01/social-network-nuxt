import type { UserProfileResponse } from '#shared/types/api'
import type { MediaImage, Post, SoundByte } from '#shared/types/post'
import type { SessionUser, User, UserSummary } from '#shared/types/user'

// Artificial latency keeps loading states visible, as in the original app.
export const MOCK_LATENCY_MS = { login: 600, feed: 400, users: 300 } as const

const CURRENT_USER_ID = '1'
const HOUR_MS = 60 * 60 * 1000

interface UserSeed {
  user: User
  connectionIds: readonly string[]
  soundBytes: readonly SoundByte[]
}

const HTML_TIP_PART_3: SoundByte = {
  id: 'sb-html-tip-3',
  title: 'HTML 5 Tip - Part 3',
  tag: 'Advice',
  publishedAt: '2020-10-06T07:21:00.000Z',
}

const USER_SEEDS: readonly UserSeed[] = [
  {
    user: {
      id: '1',
      name: 'Allan Paterson',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      email: 'allan@example.com',
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
    user: {
      id: '2',
      name: 'Sarah Johnson',
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      email: 'sarah.johnson@example.com',
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
    user: {
      id: '3',
      name: 'Mike Chen',
      avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
      email: 'mike.chen@example.com',
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
    user: {
      id: '4',
      name: 'Dina Foster',
      avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      email: 'dina.foster@example.com',
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
    user: {
      id: '5',
      name: 'Matt Redman',
      avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
      email: 'matt.redman@example.com',
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
    user: {
      id: '6',
      name: 'Chris Pyne',
      avatarUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
      email: 'chris.pyne@example.com',
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

function summaryOf(id: string): UserSummary {
  const { name, avatarUrl } = requireUser(id)
  return { id, name, avatarUrl }
}

function picsum(id: number, width: number, height: number, alt: string): MediaImage {
  return { url: `https://picsum.photos/id/${id}/${width}/${height}`, alt, width, height }
}

export function simulateLatency(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getSessionUser(): SessionUser {
  const { id, name, avatarUrl, email } = requireUser(CURRENT_USER_ID)
  return { id, name, avatarUrl, email }
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

/** Builds the feed on every call so timestamps stay relative to the request. */
export function getFeed(now: number): Post[] {
  const hoursAgo = (hours: number) => new Date(now - hours * HOUR_MS).toISOString()

  return [
    {
      id: 'post-1',
      author: summaryOf('2'),
      activity: { type: 'connection', target: summaryOf('4'), othersCount: 8 },
      text: null,
      attachment: { type: 'image', image: picsum(1011, 1200, 800, 'Woman paddling a red canoe on a calm lake') },
      createdAt: hoursAgo(1),
      likes: 45,
      comments: 12,
      shares: 4,
      isLiked: false,
      isBookmarked: false,
    },
    {
      id: 'post-2',
      author: summaryOf('3'),
      activity: { type: 'connection', target: summaryOf('5'), othersCount: 3 },
      text: null,
      attachment: {
        type: 'gallery',
        images: [
          picsum(1015, 800, 800, 'River winding through a green mountain valley'),
          picsum(1016, 800, 800, 'Sunlit canyon walls'),
          picsum(1018, 800, 800, 'Mountain range under a blue sky'),
        ],
      },
      createdAt: hoursAgo(2),
      likes: 32,
      comments: 8,
      shares: 2,
      isLiked: true,
      isBookmarked: false,
    },
    {
      id: 'post-3',
      author: summaryOf('4'),
      activity: { type: 'check-in', target: summaryOf('2'), othersCount: 8, place: 'Lady Bird Lake, Austin' },
      text: null,
      attachment: null,
      createdAt: hoursAgo(4),
      likes: 18,
      comments: 5,
      shares: 1,
      isLiked: false,
      isBookmarked: false,
    },
    {
      id: 'post-4',
      author: summaryOf('6'),
      activity: null,
      text: 'Here\'s Part 3 Of HTML Mini Series. Hope You all will enjoy',
      attachment: { type: 'sound-byte', soundByte: { ...HTML_TIP_PART_3 } },
      createdAt: hoursAgo(6),
      likes: 64,
      comments: 21,
      shares: 9,
      isLiked: false,
      isBookmarked: true,
    },
    {
      id: 'post-5',
      author: summaryOf(CURRENT_USER_ID),
      activity: null,
      text: 'Was great meeting up with Anna Ferguson and Dave Bishop at the breakfast talk!',
      attachment: { type: 'image', image: picsum(1060, 1200, 800, 'Barista pouring coffee into a cup') },
      createdAt: hoursAgo(9),
      likes: 27,
      comments: 6,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
    },
    {
      id: 'post-6',
      author: summaryOf('5'),
      activity: null,
      text: 'Watch My New Video released on Nov 12th 2020. Do Subscribe & Like.',
      attachment: { type: 'video', poster: picsum(0, 1280, 720, 'Laptop on a wooden desk') },
      createdAt: hoursAgo(26),
      likes: 112,
      comments: 45,
      shares: 17,
      isLiked: false,
      isBookmarked: false,
    },
  ]
}
