import type { FeedPage } from '#shared/types/api'
import type { MediaImage, Post, SoundByte } from '#shared/types/post'
import { CURRENT_USER_ID, HTML_TIP_PART_3, picsum, summaryOf } from './mock-db'

export const FEED_PAGE_SIZE = 6

const HOUR_MS = 60 * 60 * 1000
const GENERATED_POST_COUNT = 24
const AUTHOR_IDS = ['1', '2', '3', '4', '5', '6'] as const

const IMAGES: readonly MediaImage[] = [
  picsum(1025, 1200, 800, 'Pug wrapped in a blanket'),
  picsum(1003, 1200, 800, 'Young deer standing in a meadow'),
  picsum(1039, 1200, 800, 'Waterfall in a forest'),
  picsum(1036, 1200, 800, 'Snowy forest at dawn'),
  picsum(1080, 1200, 800, 'Strawberries on a wooden table'),
  picsum(1084, 1200, 800, 'Walrus resting on the shore'),
  picsum(1069, 1200, 800, 'Jellyfish glowing in dark water'),
  picsum(1074, 1200, 800, 'Lioness lying in the grass'),
]

const TEXTS = [
  'Shipped the new onboarding flow today. Huge thanks to everyone who tested it!',
  'Morning reading: a deep dive into CSS container queries. Highly recommend.',
  'Anyone else going to the design systems meetup next week?',
  'Pair programming session went great. Learned three new shortcuts.',
  'Finally cleaned up my desk. Productivity +100%.',
  'Weekend project: a tiny weather app with a big personality.',
  'Accessibility is not a feature, it is a baseline.',
] as const

const PLACES = ['Blue Bottle Coffee, Oakland', 'Pike Place Market, Seattle', 'Zilker Park, Austin', 'Hyde Park, London'] as const

const SOUND_BYTES: readonly SoundByte[] = [
  { id: 'sb-css-grid', title: 'CSS Grid in 3 Minutes', tag: 'Tutorial', publishedAt: '2020-10-08T10:00:00.000Z' },
  { id: 'sb-standups', title: 'Shorter Standups', tag: 'Advice', publishedAt: '2020-09-24T08:30:00.000Z' },
]

type HoursAgo = (hours: number) => string
type PostContent = Pick<Post, 'activity' | 'text' | 'attachment'>

function pick<T>(items: readonly T[], index: number): T {
  const item = items[index % items.length]
  if (item === undefined) throw new Error('Mock data list is empty')
  return item
}

// post-1…post-6 are the original feed; existing e2e scenarios rely on their content, counters and order.
function originalPosts(hoursAgo: HoursAgo): Post[] {
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

// Cycles through the same activity and attachment kinds as the original posts.
function generatedContent(index: number, authorId: string): PostContent {
  const target = summaryOf(pick(AUTHOR_IDS.filter(id => id !== authorId), index))
  const text = pick(TEXTS, index)
  switch (index % 6) {
    case 0: return { activity: null, text, attachment: { type: 'image', image: pick(IMAGES, index) } }
    case 1: return {
      activity: { type: 'connection', target, othersCount: index % 4 },
      text: null,
      attachment: { type: 'gallery', images: [0, 1, 2].map(offset => pick(IMAGES, index + offset)) },
    }
    case 2: return {
      activity: { type: 'check-in', target, othersCount: index % 3, place: pick(PLACES, index) },
      text: null,
      attachment: null,
    }
    case 3: return { activity: null, text, attachment: { type: 'sound-byte', soundByte: { ...pick(SOUND_BYTES, index) } } }
    case 4: return { activity: null, text, attachment: null }
    default: return { activity: null, text, attachment: { type: 'video', poster: pick(IMAGES, index) } }
  }
}

function generatedPost(index: number, hoursAgo: HoursAgo): Post {
  const authorId = pick(AUTHOR_IDS, index)
  return {
    id: `post-${index + 7}`,
    author: summaryOf(authorId),
    ...generatedContent(index, authorId),
    // Older than post-6 (26 h), so the original first page stays first.
    createdAt: hoursAgo(30 + index * 6),
    likes: 5 + ((index * 37) % 140),
    // index 0 → no comments: covers the empty comments state.
    comments: (index * 7) % 19,
    shares: index % 5,
    isLiked: index % 5 === 2,
    isBookmarked: index % 7 === 3,
  }
}

/** Builds every post on each call so timestamps stay relative to the request. Newest first. */
export function getFeed(now: number): Post[] {
  const hoursAgo: HoursAgo = hours => new Date(now - hours * HOUR_MS).toISOString()
  const generated = Array.from({ length: GENERATED_POST_COUNT }, (_, index) => generatedPost(index, hoursAgo))
  return [...originalPosts(hoursAgo), ...generated]
}

/**
 * The cursor is the id of the first post of the requested page, not a time: `createdAt` moves with every request.
 * Returns null for an unknown cursor; a non-string one (`?cursor=a&cursor=b`) matches no id either.
 */
export function getFeedPage(now: number, cursor: unknown): FeedPage | null {
  const posts = getFeed(now)
  const start = cursor === undefined ? 0 : posts.findIndex(post => post.id === cursor)
  if (start < 0) return null
  const end = start + FEED_PAGE_SIZE
  return { posts: posts.slice(start, end), nextCursor: posts[end]?.id ?? null }
}
