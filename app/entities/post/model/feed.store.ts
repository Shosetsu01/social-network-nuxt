import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Post } from '#shared/types/post'
import { postService } from '../api/post.service'
import { withToggledBookmark, withToggledLike } from '../lib/post'

const LOAD_ERROR_MESSAGE = 'Could not load the feed.'

// The feed lives in Pinia, not useAsyncData: it is mutable (likes) and survives navigation to profiles.
// Posts are normalized, so the feed and the post page share one record and one like state.
export const useFeedStore = defineStore('feed', () => {
  const entities = ref<Record<string, Post>>({})
  const feedIds = ref<string[]>([])
  // A ref, not a local variable: it must reach the SSR payload, or the client would think the feed has ended.
  const nextCursor = ref<string | null>(null)
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
  const loadMoreStatus = ref<'idle' | 'pending' | 'error'>('idle')
  const error = ref<string | null>(null)
  // Bumped by every reload and by reset(): a response that belongs to an older generation is dropped,
  // so a feed requested before logout cannot reappear after it.
  let generation = 0

  const posts = computed(() => feedIds.value.flatMap(id => getPost(id) ?? []))
  const hasMore = computed(() => nextCursor.value !== null)

  // A record the store already has wins over the server copy: a local like must not be undone by a refetch.
  function mergeEntities(incoming: Post[]): void {
    const fresh = incoming.filter(post => !Object.hasOwn(entities.value, post.id))
    if (fresh.length === 0) return
    entities.value = { ...entities.value, ...Object.fromEntries(fresh.map(post => [post.id, post])) }
  }

  async function reload(): Promise<void> {
    if (status.value === 'pending') return
    generation += 1
    const requestGeneration = generation
    status.value = 'pending'
    loadMoreStatus.value = 'idle'
    error.value = null
    try {
      const page = await postService.getFeed()
      if (requestGeneration !== generation) return
      mergeEntities(page.posts)
      feedIds.value = page.posts.map(post => post.id)
      nextCursor.value = page.nextCursor
      status.value = 'success'
    }
    catch {
      if (requestGeneration !== generation) return
      // Every cause leads to the same UI: a fixed message with Retry.
      error.value = LOAD_ERROR_MESSAGE
      status.value = 'error'
    }
  }

  async function ensureLoaded(): Promise<void> {
    if (status.value === 'success') return
    await reload()
  }

  async function loadMore(): Promise<void> {
    const cursor = nextCursor.value
    if (status.value !== 'success' || cursor === null || loadMoreStatus.value === 'pending') return
    const requestGeneration = generation
    loadMoreStatus.value = 'pending'
    try {
      const page = await postService.getFeed(cursor)
      if (requestGeneration !== generation) return
      mergeEntities(page.posts)
      const known = new Set(feedIds.value)
      feedIds.value = [...feedIds.value, ...page.posts.map(post => post.id).filter(id => !known.has(id))]
      nextCursor.value = page.nextCursor
      loadMoreStatus.value = 'idle'
    }
    catch {
      if (requestGeneration !== generation) return
      // The UI shows a fixed message with Retry; there is no automatic retry.
      loadMoreStatus.value = 'error'
    }
  }

  function upsertPost(post: Post): void {
    mergeEntities([post])
  }

  // Own keys only: `entities.constructor` would otherwise be Object itself.
  function getPost(id: string): Post | undefined {
    return Object.hasOwn(entities.value, id) ? entities.value[id] : undefined
  }

  function updatePost(id: string, update: (post: Post) => Post): void {
    const post = getPost(id)
    if (!post) return
    entities.value = { ...entities.value, [id]: update(post) }
  }

  function toggleLike(id: string): void {
    updatePost(id, withToggledLike)
  }

  function toggleBookmark(id: string): void {
    updatePost(id, withToggledBookmark)
  }

  function reset(): void {
    generation += 1
    entities.value = {}
    feedIds.value = []
    nextCursor.value = null
    status.value = 'idle'
    loadMoreStatus.value = 'idle'
    error.value = null
  }

  return {
    entities,
    feedIds,
    nextCursor,
    status,
    loadMoreStatus,
    error,
    posts,
    hasMore,
    ensureLoaded,
    reload,
    loadMore,
    upsertPost,
    getPost,
    toggleLike,
    toggleBookmark,
    reset,
  }
})
