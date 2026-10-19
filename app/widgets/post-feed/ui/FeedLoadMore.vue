<script setup lang="ts">
import { useFeedStore } from '@entities/post'
import { AppSpinner, ErrorState } from '@shared/ui'

// Requests the next page while the reader still has about a screen of posts left.
const PRELOAD_MARGIN = '0px 0px 600px 0px'

const feed = useFeedStore()
const sentinel = useTemplateRef<HTMLElement>('sentinel')

const isSentinelVisible = ref(false)
const announcement = ref('')
let observer: IntersectionObserver | null = null

const canLoadMore = computed(() => feed.status === 'success' && feed.hasMore && feed.loadMoreStatus === 'idle')

async function loadNextPage(): Promise<void> {
  const countBefore = feed.posts.length
  // Stale until the re-keyed sentinel gets a fresh observer: otherwise canLoadMore turning true again
  // would load a second page for the same scroll.
  isSentinelVisible.value = false
  // Cleared first: setting the same text again would not be announced.
  announcement.value = ''
  await feed.loadMore()
  const added = feed.posts.length - countBefore
  if (added > 0) announcement.value = `Loaded ${added} more posts.`
}

function disconnect(): void {
  observer?.disconnect()
  observer = null
  isSentinelVisible.value = false
}

// The observer follows the element itself: it may appear after mount and disappear with the feed state.
watch(sentinel, (element) => {
  disconnect()
  if (!element) return
  observer = new IntersectionObserver(([entry]) => {
    isSentinelVisible.value = entry?.isIntersecting ?? false
  }, { rootMargin: PRELOAD_MARGIN })
  observer.observe(element)
}, { flush: 'post' })

// One trigger for both cases: the sentinel scrolls into view, or a page lands while it is still in view
// (a tall screen keeps filling up). An error turns canLoadMore off, so there is no automatic retry.
watch([isSentinelVisible, canLoadMore], ([isVisible, canLoad]) => {
  if (isVisible && canLoad) void loadNextPage()
})

onBeforeUnmount(disconnect)
</script>

<template>
  <div class="feed-load-more">
    <!-- Re-keyed per page: a new element gets a new observer, whose first report says whether it is still in range. -->
    <div
      :key="feed.posts.length"
      ref="sentinel"
      class="feed-load-more__sentinel"
      aria-hidden="true"
    />
    <div
      v-if="feed.loadMoreStatus === 'pending'"
      class="feed-load-more__state"
      data-testid="feed-loading-more"
      aria-busy="true"
    >
      <AppSpinner :size="24" />
      <span class="visually-hidden">Loading more posts…</span>
    </div>
    <ErrorState
      v-else-if="feed.loadMoreStatus === 'error'"
      class="feed-load-more__error"
      message="Could not load more posts."
      @retry="loadNextPage()"
    />
    <p
      v-else-if="!feed.hasMore"
      class="feed-load-more__state"
    >
      You're all caught up.
    </p>
    <p
      class="visually-hidden"
      role="status"
    >
      {{ announcement }}
    </p>
  </div>
</template>

<style scoped>
.feed-load-more {
  border-top: 1px solid var(--color-border);
}

/* One pixel tall: some engines never report a zero-area target as intersecting. */
.feed-load-more__sentinel {
  height: 1px;
}

.feed-load-more__state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(var(--tap-size) * 2);
  padding: var(--space-4);
  color: var(--color-text-muted);
  text-align: center;
}

.feed-load-more__error {
  margin: var(--space-4);
}
</style>
