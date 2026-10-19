import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Post } from '#shared/types/post'
import { postService } from '../api/post.service'
import { withToggledBookmark, withToggledLike } from '../lib/post'

const LOAD_ERROR_MESSAGE = 'Could not load the feed.'

// The feed lives in Pinia, not useAsyncData: it is mutable (likes) and survives navigation to profiles.
export const useFeedStore = defineStore('feed', () => {
  const posts = ref<Post[]>([])
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
  const error = ref<string | null>(null)
  // Bumped by every load and by reset(): a response that belongs to an older generation is dropped,
  // so a feed requested before logout cannot reappear after it.
  let generation = 0

  async function reload(): Promise<void> {
    if (status.value === 'pending') return
    generation += 1
    const requestGeneration = generation
    status.value = 'pending'
    error.value = null
    try {
      const result = await postService.getFeed()
      if (requestGeneration !== generation) return
      posts.value = result
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

  function updatePost(id: string, update: (post: Post) => Post): void {
    posts.value = posts.value.map(post => (post.id === id ? update(post) : post))
  }

  function toggleLike(id: string): void {
    updatePost(id, withToggledLike)
  }

  function toggleBookmark(id: string): void {
    updatePost(id, withToggledBookmark)
  }

  function reset(): void {
    generation += 1
    posts.value = []
    status.value = 'idle'
    error.value = null
  }

  return { posts, status, error, ensureLoaded, reload, toggleLike, toggleBookmark, reset }
})
