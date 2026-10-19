<script setup lang="ts">
import { PostCardSkeleton, postService, useFeedStore } from '@entities/post'
import { ErrorState } from '@shared/ui'
import { PostDetails } from '@widgets/post-details'

const NOT_FOUND_STATUS = 404

const route = useRoute()
const feed = useFeedStore()

// `[id]` is a single segment, but the router types every param as string | string[].
const id = computed(() => {
  const param = route.params.id
  return (Array.isArray(param) ? param[0] : param) ?? ''
})

const { data: comments, status, error, refresh } = await useAsyncData(
  () => `post:${id.value}`,
  async () => {
    const details = await postService.getPost(id.value)
    // Here, not in a watcher: the handler also runs on the server, so the post lands in the Pinia payload
    // and SSR renders the card. A post the store already has keeps its local like.
    feed.upsertPost(details.post)
    return details.comments
  },
  // The server still waits for the data; client navigation renders at once and shows the loading state.
  { lazy: true },
)

// The card comes from the store, so a like here is the same like in the feed.
const post = computed(() => feed.getPost(id.value))

useHead({ title: () => (post.value ? `Post by ${post.value.author.name} · Socio Network` : 'Socio Network') })

// Only a missing post is a page-level error; other failures stay inline with a retry.
function throwIfNotFound(statusCode: number | undefined): void {
  if (statusCode === NOT_FOUND_STATUS) {
    throw createError({ statusCode: NOT_FOUND_STATUS, statusMessage: 'Post not found', fatal: true })
  }
}

// SSR: the request has settled by now. `fatal` swaps the page for error.vue on the client too.
throwIfNotFound(error.value?.statusCode)

// Client navigation (lazy), an id change in a reused page and a retry settle after setup.
watch(error, value => throwIfNotFound(value?.statusCode))
</script>

<template>
  <div class="post-page">
    <PostDetails
      v-if="status === 'success' && post && comments"
      :post="post"
      :comments="comments"
    />
    <ErrorState
      v-else-if="status === 'error'"
      class="post-page__error"
      message="Could not load the post."
      @retry="refresh()"
    />
    <div
      v-else
      class="post-page__loading"
      aria-busy="true"
    >
      <p class="visually-hidden">
        Loading post…
      </p>
      <PostCardSkeleton />
    </div>
  </div>
</template>

<style scoped>
.post-page {
  width: 100%;
  max-width: var(--content-max-width);
  margin-inline: auto;
}

.post-page__loading {
  background: var(--color-surface);
}

.post-page__error {
  margin: var(--space-4);
}

@media (min-width: 640px) {
  .post-page {
    padding-block: var(--space-5);
  }

  .post-page__error {
    margin: 0;
  }

  .post-page__loading {
    overflow: hidden;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }
}
</style>
